/**
 * Stage 9 - cut the page images into strips for a second, human-or-vision read.
 *
 * Cross-footing tells us which rows are wrong; it cannot tell us what they
 * should say. Only the page can. This cuts the rows that matter into strips
 * legible enough to read back.
 *
 * Which rows matter:
 *   - every total, sub-total and grand-total row, unconditionally
 *   - every row that fails an arithmetic identity
 *   - the top band of a statement's first page, which carries the agency total
 *     and the programme breakdown that the budget story is built on
 *
 * Each row is emitted as TWO strips, left and right. A full-width strip of a
 * 24-column form has to be scaled so far down to fit a sane image width that
 * the digits stop being readable -- which would defeat the point of looking
 * again.
 *
 * IMPORTANT: the queue deliberately does NOT carry the OCR values. A reader
 * shown the machine's answer tends to confirm it; the whole value of a second
 * read is that it is independent. Stage 10 does the comparison.
 *
 * Usage:
 *   node scripts/psc-data/09-verify-crops.mjs [--only <docId>] [--top-band]
 */
import { execFile } from 'node:child_process';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const W = path.join(ROOT, 'data/derived/_work');
const DERIVED = path.join(ROOT, 'data/derived/far1');
const CROPS = path.join(W, 'verify/crops');

const arg = (f, d) => {
  const i = process.argv.indexOf(f);
  return i > -1 ? process.argv[i + 1] : d;
};
const ONLY = arg('--only', null);
/** Crop the whole top band of each statement rather than row by row. */
const TOP_BAND = process.argv.includes('--top-band');

/** Target width per half-strip: legible without being wasteful. */
const HALF_WIDTH = 1640;

/**
 * pdftoppm pads the page number to the width of the page COUNT -- a 7-page
 * document yields p-1.png while a 10-page one yields p-01.png. Resolve a page
 * against the sorted listing rather than guessing the padding.
 */
async function pageImage(dir, page) {
  const pngs = (await readdir(dir)).filter(f => f.endsWith('.png')).sort();
  return pngs[page - 1] ? path.join(dir, pngs[page - 1]) : null;
}

async function cropHalves(png, { y, h, pageWidth, stem }) {
  const split = Math.round(pageWidth * 0.525); // a little past centre, so
  // column 12 appears in both halves and the two reads can be aligned.
  const pad = 6;
  const top = Math.max(0, Math.round(y) - pad);
  const height = Math.round(h) + pad * 2;

  await run('magick', [
    png,
    '-crop',
    `${split}x${height}+0+${top}`,
    '+repage',
    '-resize',
    `${HALF_WIDTH}x`,
    `${stem}-left.png`,
  ]);
  await run('magick', [
    png,
    '-crop',
    `${pageWidth - split}x${height}+${split}+${top}`,
    '+repage',
    '-resize',
    `${HALF_WIDTH}x`,
    `${stem}-right.png`,
  ]);
  return [`${stem}-left.png`, `${stem}-right.png`];
}

async function main() {
  await mkdir(CROPS, { recursive: true });
  const files = (await readdir(DERIVED)).filter(f => f.endsWith('.json'));
  const ids = ONLY ? [`${ONLY}.json`] : files;

  const queue = [];

  for (const f of ids) {
    const doc = JSON.parse(await readFile(path.join(DERIVED, f), 'utf8'));
    const pngDir = path.join(W, 'png', doc.docId);
    if (!existsSync(pngDir)) continue;

    if (TOP_BAND) {
      // The header legend plus the first dozen body rows: the agency total and
      // the programme rows the budget page needs, in two images per statement.
      for (const st of doc.statements.filter(s => s.rows)) {
        const page = st.pages[0];
        const png = await pageImage(pngDir, page);
        if (!png || !existsSync(png)) continue;

        const onPage = doc.rows.filter(r => r.page === page);
        if (!onPage.length) continue;
        const y0 = Math.min(...onPage.map(r => r.provenance.bbox[0]));
        const y1 = Math.max(
          ...onPage.slice(0, 14).map(r => r.provenance.bbox[1])
        );

        const { stdout } = await run('magick', [
          'identify',
          '-format',
          '%w',
          png,
        ]);
        const stem = path.join(CROPS, `${doc.docId}-s${st.statement}-band`);
        const images = await cropHalves(png, {
          y: y0 - 90, // include the printed column-number legend
          h: y1 - y0 + 110,
          pageWidth: Number(stdout),
          stem,
        });

        queue.push({
          taskId: createHash('sha256')
            .update(`${doc.docId}|${st.statement}|band`)
            .digest('hex')
            .slice(0, 16),
          docId: doc.docId,
          statement: st.statement,
          page,
          kind: 'top-band',
          rows: onPage.slice(0, 14).map(r => r.particulars),
          images: images.map(i => path.relative(ROOT, i)),
        });
      }
      continue;
    }

    const targets = doc.rows.filter(
      r => r.rowKind !== 'line' || r.provenance.checks === 'fail'
    );

    for (const r of targets) {
      const png = await pageImage(pngDir, r.page);
      if (!png || !existsSync(png)) continue;
      const { stdout } = await run('magick', [
        'identify',
        '-format',
        '%w',
        png,
      ]);
      const [y0, y1] = r.provenance.bbox;
      const stem = path.join(CROPS, `${doc.docId}-p${r.page}-y${y0}`);
      const images = await cropHalves(png, {
        y: y0,
        h: y1 - y0,
        pageWidth: Number(stdout),
        stem,
      });

      queue.push({
        taskId: createHash('sha256')
          .update(`${doc.docId}|${r.page}|${y0}|${r.particulars}`)
          .digest('hex')
          .slice(0, 16),
        docId: doc.docId,
        page: r.page,
        particulars: r.particulars,
        reason:
          r.provenance.checks === 'fail'
            ? 'failed-check'
            : `row-kind:${r.rowKind}`,
        images: images.map(i => path.relative(ROOT, i)),
      });
    }
  }

  await mkdir(path.join(W, 'verify'), { recursive: true });
  await writeFile(
    path.join(W, 'verify/queue.json'),
    JSON.stringify(
      { generatedAt: new Date().toISOString(), tasks: queue },
      null,
      2
    ) + '\n'
  );
  console.log(`${queue.length} verification tasks, ${queue.length * 2} images`);
  for (const q of queue)
    console.log(`  ${q.taskId}  ${q.docId}  ${q.kind ?? q.reason}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
