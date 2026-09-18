/**
 * Stages 3 and 4 - render scanned pages and read them.
 *
 * pdftoppm at 300 dpi, grayscale (Vision ignores colour and it halves the I/O),
 * then the Swift Vision tool over every page in one long-lived process.
 *
 * Usage:  node scripts/psc-data/03-render-ocr.mjs [--series far1] [--only <docId>] [--force]
 */
import { execFile } from 'node:child_process';
import { readFile, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync, createWriteStream } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const W = path.join(ROOT, 'data/derived/_work');
const BIN = path.join(W, 'bin/visionocr');

const arg = (f, d) => {
  const i = process.argv.indexOf(f);
  return i > -1 ? process.argv[i + 1] : d;
};
const SERIES = arg('--series', null);
const ONLY = arg('--only', null);
const FORCE = process.argv.includes('--force');

async function main() {
  const manifest = JSON.parse(
    await readFile(path.join(ROOT, 'data/manifest/manifest.json'), 'utf8')
  );
  const docs = manifest.documents.filter(
    d =>
      d.status === 'live' &&
      d.localPath?.endsWith('.pdf') &&
      (!SERIES || d.series === SERIES) &&
      (!ONLY || d.docId === ONLY)
  );
  console.log(`${docs.length} documents to render and read\n`);

  await mkdir(path.join(W, 'png'), { recursive: true });
  await mkdir(path.join(W, 'ocr'), { recursive: true });

  for (const doc of docs) {
    const out = path.join(W, 'ocr', `${doc.docId}.ndjson`);
    // One NDJSON line per page. Comparing against the manifest's page count is
    // what distinguishes a finished run from one that died halfway -- file size
    // alone happily reports a truncated read as complete.
    if (!FORCE && existsSync(out) && (await stat(out)).size > 0) {
      const lines = (await readFile(out, 'utf8')).trimEnd().split('\n').length;
      if (!doc.pages || lines >= doc.pages) {
        console.log(`${doc.docId.padEnd(22)} cached (${lines} pages)`);
        continue;
      }
      console.log(
        `${doc.docId.padEnd(22)} incomplete (${lines}/${doc.pages} pages), re-reading`
      );
    }

    const dir = path.join(W, 'png', doc.docId);
    await mkdir(dir, { recursive: true });
    const t0 = Date.now();

    if (FORCE || !(await readdir(dir)).length) {
      await run(
        'pdftoppm',
        [
          '-r',
          '300',
          '-gray',
          '-png',
          path.join(ROOT, doc.localPath),
          path.join(dir, 'p'),
        ],
        { maxBuffer: 1 << 26 }
      );
    }

    const pngs = (await readdir(dir)).filter(f => f.endsWith('.png')).sort();
    await new Promise((resolve, reject) => {
      const ocr = spawn(BIN, ['--dpi', '300'], {
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      const sink = createWriteStream(out);
      ocr.stdout.pipe(sink);

      // Wait for BOTH the process to exit and the file to flush, registering
      // each listener up front. Attaching the 'finish' handler inside the
      // 'close' handler misses it -- the stream has already finished by then,
      // the promise never settles, and node exits 0 with nothing done.
      let closed = false;
      let flushed = false;
      const done = () => closed && flushed && resolve();

      ocr.on('error', reject);
      ocr.on('close', code => {
        if (code !== 0) return reject(new Error(`visionocr exited ${code}`));
        closed = true;
        done();
      });
      sink.on('error', reject);
      sink.on('finish', () => {
        flushed = true;
        done();
      });

      for (const f of pngs) ocr.stdin.write(path.join(dir, f) + '\n');
      ocr.stdin.end();
    });

    console.log(
      `${doc.docId.padEnd(22)} ${String(pngs.length).padStart(3)} pages  ${((Date.now() - t0) / 1000).toFixed(1)}s`
    );
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
