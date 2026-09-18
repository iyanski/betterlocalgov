/**
 * Stage 1 - ingest the PDFs the browser fetched, and build the manifest.
 *
 * Consumes  data/catalog/documents.json
 *           ~/Downloads/psc__<docId>__<sha16>.pdf   (browser/fetch-batch.js)
 *           ~/Downloads/psc__fetch-results.json     (optional but preferred)
 * Emits     data/raw/<series>/<fy>/<docId>.pdf      GITIGNORED
 *           data/manifest/manifest.json             COMMITTED
 *           data/manifest/manifest.csv              COMMITTED
 *
 * The page computed a SHA-256 over the bytes that came off the wire and put the
 * first 16 hex characters in the filename. This re-hashes the bytes that
 * reached the disk and compares. A mismatch means the browser-to-disk bridge
 * corrupted something and the run stops -- silent corruption in financial
 * source documents is the one thing that would make this project worse than
 * useless.
 *
 * Usage:
 *   node scripts/psc-data/01-ingest.mjs [--downloads <dir>] [--keep] [--dry-run]
 */
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import {
  readFile,
  writeFile,
  readdir,
  mkdir,
  rename,
  unlink,
  copyFile,
} from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { summarize } from './lib/summary.mjs';

const run = promisify(execFile);
const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const RAW = path.join(ROOT, 'data/raw');
const MANIFEST = path.join(ROOT, 'data/manifest');

const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const DOWNLOADS = arg('--downloads', path.join(os.homedir(), 'Downloads'));
const KEEP = process.argv.includes('--keep');
const DRY = process.argv.includes('--dry-run');

const sha256 = buf => createHash('sha256').update(buf).digest('hex');

/** `pdfinfo` is the cheapest way to learn page count and producer. */
async function pdfInfo(file) {
  try {
    const { stdout } = await run('pdfinfo', [file], { maxBuffer: 1 << 20 });
    const get = key => {
      const m = stdout.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
      return m ? m[1].trim() : null;
    };
    const pages = get('Pages');
    return {
      pages: pages ? Number(pages) : null,
      pdfProducer: get('Producer'),
      pdfCreator: get('Creator'),
      pdfCreatedAt: get('CreationDate'),
      pageSize: get('Page size'),
      encrypted: get('Encrypted'),
    };
  } catch (err) {
    return {
      pages: null,
      pdfInfoError: String(err.message || err).slice(0, 200),
    };
  }
}

const csvCell = v => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

async function main() {
  const catalog = JSON.parse(
    await readFile(path.join(ROOT, 'data/catalog/documents.json'), 'utf8')
  );
  const byDocId = new Map(catalog.documents.map(d => [d.docId, d]));

  // Browser-side fetch records: hash, byte count and retrieval time all come
  // from the same fetch that produced the bytes, so they are preferred over
  // anything reconstructed here.
  let fetchResults = {};
  const resultsPath = path.join(DOWNLOADS, 'psc__fetch-results.json');
  if (existsSync(resultsPath)) {
    const arr = JSON.parse(await readFile(resultsPath, 'utf8'));
    fetchResults = Object.fromEntries(arr.map(r => [r.docId, r]));
    console.log(
      `read ${arr.length} fetch records from ${path.basename(resultsPath)}`
    );
  } else {
    console.warn(
      `no psc__fetch-results.json in ${DOWNLOADS} -- manifest will lack retrieval times`
    );
  }

  // Spreadsheets are worth more than the PDFs when they turn up -- no OCR at
  // all -- so they ride the same path.
  const EXT = /\.(pdf|xlsx?|docx?)$/i;
  const staged = (await readdir(DOWNLOADS)).filter(
    f => f.startsWith('psc__') && EXT.test(f)
  );
  console.log(`found ${staged.length} staged files in ${DOWNLOADS}`);

  const ingested = new Map();
  const problems = [];

  // Fetching runs in batches across several browser sessions, so most of the
  // corpus is already under data/raw by the time any given run happens. Pick
  // those up first: the manifest describes the whole corpus on disk, not just
  // whatever arrived in the last batch.
  const walkRaw = async dir => {
    if (!existsSync(dir)) return;
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walkRaw(p);
        continue;
      }
      if (!EXT.test(e.name)) continue;
      const docId = e.name.replace(EXT, '');
      if (!byDocId.has(docId)) {
        problems.push({ file: p, docId, problem: 'docId not in catalogue' });
        continue;
      }
      const buf = await readFile(p);
      ingested.set(docId, { dest: p, bytes: buf.length, sha256: sha256(buf) });
    }
  };
  await walkRaw(RAW);
  const carried = ingested.size;
  if (carried)
    console.log(`carried ${carried} already-ingested files from data/raw`);

  for (const file of staged) {
    const m = file.match(/^psc__(.+)__([0-9a-f]{16})\.(?:pdf|xlsx?|docx?)$/i);
    if (!m) {
      problems.push({ file, problem: 'unparseable filename' });
      continue;
    }
    const [, docId, claimedPrefix] = m;
    const doc = byDocId.get(docId);
    if (!doc) {
      problems.push({ file, docId, problem: 'docId not in catalogue' });
      continue;
    }

    const src = path.join(DOWNLOADS, file);
    const buf = await readFile(src);
    const actual = sha256(buf);

    if (!actual.startsWith(claimedPrefix.toLowerCase())) {
      // Hard stop. Do not ingest bytes that changed in transit.
      throw new Error(
        `SHA-256 mismatch for ${docId}: page said ${claimedPrefix}..., disk says ${actual.slice(0, 16)}...`
      );
    }
    const isPdf = buf.subarray(0, 5).toString('latin1') === '%PDF-';
    const isZip = buf[0] === 0x50 && buf[1] === 0x4b; // xlsx/docx are zip containers
    if (!isPdf && !isZip) {
      problems.push({
        file,
        docId,
        problem: 'neither a PDF nor a spreadsheet',
      });
      continue;
    }

    const ext = path.extname(file).toLowerCase();
    const dir = path.join(RAW, doc.series, String(doc.fiscalYear ?? 'unknown'));
    const dest = path.join(dir, `${docId}${ext}`);

    if (!DRY) {
      await mkdir(dir, { recursive: true });
      if (KEEP) await copyFile(src, dest);
      else {
        // rename() fails across volumes; Downloads and the repo may differ.
        try {
          await rename(src, dest);
        } catch {
          await copyFile(src, dest);
          await unlink(src);
        }
      }
    }

    ingested.set(docId, { dest, bytes: buf.length, sha256: actual });
  }

  // Build one manifest row per catalogue entry, ingested or not.
  const rows = [];
  for (const doc of catalog.documents) {
    const got = ingested.get(doc.docId);
    const fetched = fetchResults[doc.docId] || null;
    const info =
      got && !DRY && got.dest.endsWith('.pdf') ? await pdfInfo(got.dest) : {};

    const status = got
      ? 'live'
      : fetched && fetched.outcome === 'dead'
        ? 'dead'
        : fetched && fetched.outcome === 'error'
          ? 'error'
          : 'not-fetched';

    rows.push({
      docId: doc.docId,
      series: doc.series,
      inScope: doc.inScope,
      title: doc.title,
      sealSection: doc.sealSection,
      sealSectionTitle: doc.sealSectionTitle,
      subsection: doc.subsection,
      fiscalYear: doc.fiscalYear,
      period: doc.period,
      variant: doc.variant,
      sourceUrl: doc.sourceUrl,
      host: doc.host,
      sourceOfRecord: got ? 'psc' : null,
      status,
      httpStatus: fetched ? (fetched.status ?? null) : null,
      retrievedAt: fetched ? (fetched.retrievedAt ?? null) : null,
      contentType: fetched ? (fetched.contentType ?? null) : null,
      bytes: got ? got.bytes : fetched ? (fetched.bytes ?? null) : null,
      sha256: got ? got.sha256 : fetched ? (fetched.sha256 ?? null) : null,
      pages: info.pages ?? null,
      pdfProducer: info.pdfProducer ?? null,
      pdfCreatedAt: info.pdfCreatedAt ?? null,
      pageSize: info.pageSize ?? null,
      kind: null, // stage 02
      localPath: got ? path.relative(ROOT, got.dest) : null,
      extraction: got ? 'pending' : doc.inScope ? 'unavailable' : 'skipped',
      rowsExtracted: null,
      checksPassed: null,
      checksFailed: null,
      rowsAiVerified: null,
      notes: fetched && fetched.error ? fetched.error.slice(0, 200) : null,
    });
  }

  if (!DRY) {
    await mkdir(MANIFEST, { recursive: true });
    await writeFile(
      path.join(MANIFEST, 'manifest.json'),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          catalogGeneratedAt: catalog.generatedAt,
          documents: rows,
        },
        null,
        2
      ) + '\n'
    );
    // The counts and the shape-of-the-archive findings that /data quotes. See
    // lib/summary.mjs for why they are derived rather than written by hand.
    await writeFile(
      path.join(MANIFEST, 'summary.json'),
      JSON.stringify(
        { generatedAt: new Date().toISOString(), ...summarize(rows) },
        null,
        2
      ) + '\n'
    );

    const cols = Object.keys(rows[0]);
    await writeFile(
      path.join(MANIFEST, 'manifest.csv'),
      [
        cols.join(','),
        ...rows.map(r => cols.map(c => csvCell(r[c])).join(',')),
      ].join('\n') + '\n'
    );
  }

  const count = s => rows.filter(r => r.status === s).length;
  const mb =
    rows.reduce((a, r) => a + (r.localPath ? r.bytes : 0), 0) / 1048576;
  console.log(
    `\ningested ${ingested.size} PDFs (${mb.toFixed(1)} MB)` +
      (DRY ? '  [dry run, nothing written]' : '')
  );
  console.log(
    `manifest: ${rows.length} rows | live ${count('live')}  dead ${count('dead')}  error ${count('error')}  not-fetched ${count('not-fetched')}`
  );

  const missing = rows.filter(r => r.inScope && r.status === 'not-fetched');
  if (missing.length) {
    console.warn(
      `\n${missing.length} in-scope documents have not been fetched yet:`
    );
    const bySeries = {};
    for (const r of missing) bySeries[r.series] = (bySeries[r.series] || 0) + 1;
    for (const [k, v] of Object.entries(bySeries))
      console.warn(`  ${String(v).padStart(3)}  ${k}`);
  }
  if (problems.length) {
    console.warn(`\n${problems.length} staged files could not be ingested:`);
    for (const p of problems) console.warn(`  ${p.file} -- ${p.problem}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
