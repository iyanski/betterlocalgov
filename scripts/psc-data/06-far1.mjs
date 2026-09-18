/**
 * Extract FAR No. 1 (SAAOBDB) into rows, and check the arithmetic.
 *
 * Consumes  data/derived/_work/ocr/<docId>.ndjson   (stage 04)
 *           scripts/psc-data/layouts/far1.json
 * Emits     data/derived/far1/<docId>.json          COMMITTED
 *
 * Two things make this work where a generic table extractor does not:
 *
 *  1. Columns are recovered by pooling the right edges of every money token
 *     across ALL pages of a statement, not one page at a time. Financial
 *     columns are right-aligned, so a column's right edge is stable to a pixel
 *     while its left edge wanders with the size of the number; pooling gives
 *     each of the 22 money columns 60-80 votes instead of a handful, and the
 *     answer stops depending on which rows happened to be full.
 *
 *  2. Numbers that OCR split at their separators are put back together first
 *     (lib/cluster.mjs), or the fragments vote as if they were columns.
 *
 * Every row carries how it was read and whether it balances. A row that does
 * not balance is kept and flagged, never dropped and never quietly fixed.
 *
 * Usage:
 *   node scripts/psc-data/06-far1.mjs [--only <docId>] [--verbose]
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  groupRows,
  mergeNumericFragments,
  cluster1d,
  buildGrid,
} from './lib/cluster.mjs';
import {
  parseMoney,
  repairCandidates,
  strictSum,
  closeEnough,
} from './lib/numbers.mjs';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const OCR = path.join(ROOT, 'data/derived/_work/ocr');
const OUT = path.join(ROOT, 'data/derived/far1');

const arg = (flag, fb) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : fb;
};
const ONLY = arg('--only', null);
const VERBOSE = process.argv.includes('--verbose');

const MONEY = /^\(?-?[\d,]+\.\d{2}\)?$/;

const layout = JSON.parse(
  await readFile(path.join(ROOT, 'scripts/psc-data/layouts/far1.json'), 'utf8')
);
const FIELDS = layout.fields.map(f => f.key);

/**
 * Split a rendered PDF into statements.
 *
 * One PDF holds several SAAOBDB statements -- one per fund cluster -- and they
 * must not be pooled together: they are different tables that happen to share a
 * layout. The printed "Page 1 of N" footer marks each start.
 */
function splitStatements(pages) {
  const starts = [];
  pages.forEach((p, i) => {
    const text = p.lines.map(l => l.text).join(' ');
    const m = text.match(/Page\s+(\d+)\s+of\s+(\d+)/i);
    if (m && Number(m[1]) === 1) starts.push({ index: i, of: Number(m[2]) });
  });
  if (!starts.length) return [{ from: 0, to: pages.length - 1 }];

  return starts.map((s, i) => ({
    from: s.index,
    to: i + 1 < starts.length ? starts[i + 1].index - 1 : pages.length - 1,
  }));
}

/**
 * Normalise a page's words: split cells OCR welded together, then reassemble
 * numbers it split apart. Order matters -- splitting first stops a welded pair
 * from being treated as a fragment run.
 */
function prepare(page) {
  return groupRows(page.words).flatMap(r => mergeNumericFragments(r.words));
}

/** Normalised right edges of every money token on a set of pages. */
function edgeVotes(pages) {
  const votes = [];
  for (const p of pages) {
    // A welded token's right edge is still the right edge of a real column, so
    // it votes; it just happens to hide the cells to its left.
    for (const w of prepare(p)) {
      if (MONEY.test(w.text)) votes.push(w.x1 / p.width);
    }
  }
  return votes;
}

/**
 * Cluster right edges into exactly `expected` columns, sweeping the tolerance.
 * Returns null rather than a wrong answer: a statement whose columns cannot be
 * recovered is marked failed, because a misaligned column silently produces
 * figures that are wrong rather than missing.
 */
function columnsFrom(votes, expected) {
  if (votes.length < expected * 3) return null;
  const minMembers = Math.max(3, Math.floor(votes.length / (expected * 12)));
  for (const tol of [
    0.0018, 0.002, 0.0022, 0.0026, 0.003, 0.0015, 0.0012, 0.004,
  ]) {
    const groups = cluster1d(votes, tol).filter(
      g => g.members.length >= minMembers
    );
    if (groups.length === expected) {
      return {
        normalised: groups.map(g => g.centre),
        tol,
        votes: votes.length,
      };
    }
  }
  return null;
}

/**
 * Columns are resolved PER PAGE, not per statement.
 *
 * Pages in one scan are offset from each other by several pixels of scan
 * registration -- measured at a consistent 8px between consecutive pages of
 * FY2024 -- and a pooled template therefore sits a few pixels off every page it
 * is applied to, which is enough to throw a token into the neighbouring column.
 * Each page usually resolves its own 22 columns cleanly, so use those; the
 * statement-wide pool is the fallback for a page too sparse to speak for
 * itself.
 */
function resolveColumns(slice, expected) {
  const pooled = columnsFrom(edgeVotes(slice), expected);
  const perPage = slice.map(
    p => columnsFrom(edgeVotes([p]), expected) ?? pooled
  );
  return { pooled, perPage };
}

/** Parse a cell, attempting a recorded repair only if the raw text fails. */
function readCell(raw) {
  if (raw === null) return { value: null, method: 'missing', raw: null };
  const v = parseMoney(raw);
  if (v.ok && v.value !== null) return { value: v.value, method: 'ocr', raw };
  if (v.ok && v.value === null) return { value: null, method: 'missing', raw };
  const cand = repairCandidates(raw)[0];
  if (cand) {
    return {
      value: cand.value,
      method: 'ocr-repaired',
      raw,
      repairs: cand.repairs,
    };
  }
  return { value: null, method: 'unreadable', raw };
}

/** Run the layout's arithmetic identities over one row. */
function checkRow(row) {
  const failures = [];
  let checked = 0;
  let rounding = 0;

  for (const c of layout.checks) {
    const lhs = c.lhsSum ? strictSum(c.lhsSum.map(k => row[k])) : row[c.lhs];
    const rhs = c.sum
      ? strictSum(c.sum.map(k => row[k]))
      : row[c.diff[0]] === null || row[c.diff[1]] === null
        ? null
        : Math.round((row[c.diff[0]] - row[c.diff[1]]) * 100) / 100;

    if (lhs === null || rhs === null) continue;
    checked++;
    if (closeEnough(lhs, rhs, 0.005)) continue;
    if (Math.abs(lhs - rhs) <= 1) {
      rounding++;
      continue;
    }
    failures.push({ rule: c.rule, delta: Math.round((lhs - rhs) * 100) / 100 });
  }

  return {
    checked,
    rounding,
    failures,
    status: failures.length
      ? 'fail'
      : rounding
        ? 'pass-rounding'
        : checked
          ? 'pass'
          : 'not-applicable',
  };
}

const ROW_KIND = label => {
  const l = label.toUpperCase();
  if (/GRAND\s*TOTAL/.test(l)) return 'grand-total';
  if (/SUB-?\s*TOTAL/.test(l)) return 'subtotal';
  if (/\bTOTAL\b/.test(l)) return 'total';
  return 'line';
};

const EXPENSE = label => {
  const l = label.toUpperCase().replace(/[^A-Z]/g, '');
  if (l === 'PS') return 'PS';
  if (l === 'MOOE') return 'MOOE';
  if (l === 'CO') return 'CO';
  if (l.startsWith('FINEX')) return 'FinEx';
  return null;
};

async function extract(docId) {
  const file = path.join(OCR, `${docId}.ndjson`);
  if (!existsSync(file)) return { docId, error: 'no OCR output' };

  const pages = (await readFile(file, 'utf8'))
    .trim()
    .split('\n')
    .map(l => JSON.parse(l));

  const statements = splitStatements(pages);
  const rows = [];
  const stmtMeta = [];

  for (const [si, seg] of statements.entries()) {
    const slice = pages.slice(seg.from, seg.to + 1);
    const { pooled, perPage } = resolveColumns(slice, layout.moneyColumns);

    if (!pooled && perPage.every(c => !c)) {
      stmtMeta.push({
        statement: si,
        pages: [seg.from + 1, seg.to + 1],
        extraction: 'failed',
        reason: `could not recover ${layout.moneyColumns} money columns`,
      });
      continue;
    }

    let kept = 0;
    let pagesSkipped = 0;
    for (const [pi, p] of slice.entries()) {
      const cols = perPage[pi];
      if (!cols) {
        pagesSkipped++;
        continue;
      }
      const columns = cols.normalised.map(c => ({ right: c * p.width }));
      const merged = prepare(p);

      // The table body starts at the first row that is mostly figures.
      const bodyRows = groupRows(merged);
      const first = bodyRows.find(
        r => r.words.filter(w => MONEY.test(w.text)).length >= 5
      );
      if (!first) continue;
      const body = merged.filter(w => w.y0 >= first.y0 - 4);

      for (const r of buildGrid(body, columns)) {
        const filled = r.cells.filter(c => c !== null).length;
        if (filled < 6) continue; // header noise, footers, signature blocks

        const row = {};
        const cells = {};
        FIELDS.forEach((key, i) => {
          const read = readCell(r.cells[i] ?? null);
          row[key] = read.value;
          if (read.method !== 'ocr') cells[key] = read;
        });

        const label = r.label.replace(/\s+/g, ' ').trim();
        const check = checkRow(row);
        rows.push({
          docId,
          statement: si,
          page: seg.from + pi + 1,
          particulars: label,
          expenseClass: EXPENSE(label),
          rowKind: ROW_KIND(label),
          uacsCode: (label.match(/\b(\d{12,15})\b/) || [])[1] ?? null,
          ...row,
          provenance: {
            method: Object.keys(cells).length ? 'ocr-repaired' : 'ocr',
            checks: check.status,
            checkFailures: check.failures.length ? check.failures : undefined,
            cells: Object.keys(cells).length ? cells : undefined,
            bbox: [Math.round(r.y0), Math.round(r.y1)],
          },
        });
        kept++;
      }
    }

    stmtMeta.push({
      statement: si,
      pages: [seg.from + 1, seg.to + 1],
      extraction: pagesSkipped ? 'partial' : 'complete',
      pagesSkipped,
      columnVotes: pooled ? pooled.votes : null,
      rows: kept,
    });
  }

  const tally = k => rows.filter(r => r.provenance.checks === k).length;
  return {
    docId,
    generatedAt: new Date().toISOString(),
    layout: 'far1',
    statements: stmtMeta,
    summary: {
      rows: rows.length,
      pass: tally('pass'),
      passRounding: tally('pass-rounding'),
      fail: tally('fail'),
      notApplicable: tally('not-applicable'),
    },
    rows,
  };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const files = (await readdir(OCR)).filter(f => f.endsWith('.ndjson'));
  const ids = (
    ONLY ? [ONLY] : files.map(f => f.replace(/\.ndjson$/, ''))
  ).filter(id => id.startsWith('far1'));

  let allRows = 0,
    allPass = 0,
    allRound = 0,
    allFail = 0;

  for (const docId of ids) {
    const result = await extract(docId);
    if (result.error) {
      console.log(`${docId.padEnd(16)} ${result.error}`);
      continue;
    }
    await writeFile(
      path.join(OUT, `${docId}.json`),
      JSON.stringify(result, null, 2) + '\n'
    );
    const s = result.summary;
    const rate = s.rows
      ? (((s.pass + s.passRounding) / s.rows) * 100).toFixed(0)
      : '0';
    console.log(
      `${docId.padEnd(16)} ${String(s.rows).padStart(4)} rows | pass ${String(s.pass).padStart(3)}` +
        ` +${String(s.passRounding).padStart(2)} rounding | fail ${String(s.fail).padStart(3)}` +
        ` | n/a ${String(s.notApplicable).padStart(3)} | ${rate}%` +
        `  [${result.statements.map(st => (st.extraction === 'complete' ? st.rows : 'FAILED')).join('/')}]`
    );
    if (VERBOSE) {
      for (const r of result.rows
        .filter(r => r.provenance.checks === 'fail')
        .slice(0, 5)) {
        console.log(
          `    ${r.particulars.slice(0, 30).padEnd(31)} ${r.provenance.checkFailures.map(f => `${f.rule.split(' =')[0]} Δ${f.delta.toLocaleString()}`).join('; ')}`
        );
      }
    }
    allRows += s.rows;
    allPass += s.pass;
    allRound += s.passRounding;
    allFail += s.fail;
  }

  const checkable = allPass + allRound + allFail;
  console.log(
    `\n${ids.length} documents | ${allRows} rows | ${checkable} with checkable arithmetic` +
      (checkable
        ? ` | ${(((allPass + allRound) / checkable) * 100).toFixed(1)}% balance`
        : '')
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
