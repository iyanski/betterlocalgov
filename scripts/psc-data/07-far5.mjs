/**
 * Extract FAR No. 5 (Quarterly Report of Revenue and Other Receipts) into rows,
 * and check the arithmetic.
 *
 * Consumes  data/derived/_work/ocr/<docId>.ndjson   (stage 04)
 *           scripts/psc-data/layouts/far5.json
 * Emits     data/derived/far5/<docId>.json          COMMITTED
 *
 * Where FAR No. 1 recovers its columns by pooling the right edges of every
 * money token, this form cannot: columns 9 to 13 are blank in most years, and
 * the count of populated columns swings between 5 and 10 across the series. A
 * cluster count therefore says nothing about which column is which, and a
 * misread column produces figures that are wrong rather than missing.
 *
 * So columns come from the printed header instead. "TARGET", "1st Quarter",
 * "AGDB" and the column-arithmetic captions ("8=(4+5+6+7)") are set in a larger
 * face than the body and survive OCR on every scan in the series -- including
 * FY2022 and FY2024, whose bodies are badly degraded. Each anchor is a column
 * centre; a figure belongs to the column whose centre is nearest to its left.
 *
 * Every row carries how it was read and whether it balances. A row that does
 * not balance is kept and flagged, never dropped and never quietly fixed.
 *
 * One PDF holds the whole year: a separate statement for each quarter ending,
 * each cumulative from January. The December statement is the annual one; the
 * earlier three are kept because they are an independent reading of the same
 * year-to-date figures, and stage 08 uses them as a cross-check.
 *
 * Usage:
 *   node scripts/psc-data/07-far5.mjs [--only <docId>] [--verbose]
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  groupRows,
  mergeNumericFragments,
  buildGrid,
  median,
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
const OUT = path.join(ROOT, 'data/derived/far5');

const arg = (flag, fb) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : fb;
};
const ONLY = arg('--only', null);
const VERBOSE = process.argv.includes('--verbose');

const MONEY = /^\(?-?[\d,]+\.\d{2}\)?$/;
const PERCENT = /^\(?-?[\d,]*\.?\d+\)?\s*%$/;

const layout = JSON.parse(
  await readFile(path.join(ROOT, 'scripts/psc-data/layouts/far5.json'), 'utf8')
);
const FIELDS = layout.fields.map(f => f.key);
const PERCENT_FIELDS = new Set(
  layout.fields.filter(f => f.percent).map(f => f.key)
);

/* ---------------------------------------------------------------- header --

   The figure columns are located by reading the printed header, because the
   figures themselves cannot locate them: FY2017's table leaves five of the
   eleven columns empty from top to bottom, so clustering what is printed finds
   five columns and no way to tell which five.

   Four families of caption are collected, each giving the x-centre of a column
   it names, and a column is placed where they agree:

     the column-number strip    "3"  "4" ... "8=(4+5+6+7)"  "11=(9+10)"
     the quarter captions       "1st Quarter", and the month under it
     the deposit captions       "BTr", "AGDB"
     the target caption         "TARGET", "(Annual)", "per BESF"

   No single family survives OCR on every scan -- FY2021's left-hand captions
   are missing entirely, FY2024's strip is missing, FY2022 reads column 11's
   caption as "11=(8+10)" -- but between them every page in the series is
   covered, and the ones that overlap agree to within a few pixels.          */

const centre = w => (w.x0 + w.x1) / 2;
const yCentre = w => (w.y0 + w.y1) / 2;

/**
 * The header occupies the top third of the page on the widest layout in the
 * series and rather less on the rest. Taking half the page costs nothing --
 * every pattern here is specific enough that the body does not match it -- and
 * covers FY2019, whose scan is skewed far enough that the caption row runs
 * downhill across the page.
 */
const headerWords = page => page.words.filter(w => w.y1 < page.height * 0.5);

/** "8=(4+5+6+7)", "8-[(6+(-)7}-8+9]", "13(12/3)" -> the leading column number. */
const FORMULA = /^(\d{1,2})\s*[-=:;.]?\s*[({[]/;
const formulaColumn = text => {
  const m = text.replace(/\s+/g, '').match(FORMULA);
  const n = m ? Number(m[1]) : null;
  return n !== null && n >= 3 && n <= 14 ? n : null;
};

/**
 * The strip of column numbers the form prints directly above its first data
 * row -- "1  2  3 ... 8=(4+5+6+7) ... 14" -- read as one anchor per column.
 *
 * It is the most useful family by some distance, because it names its columns
 * explicitly and sits closer to the table than any caption. The risk is
 * confusing it with the row of month-ends above it, which is also a row of
 * short numbers ("March 31", "June 30"): 31 and 30 would be read as columns
 * that do not exist. Requiring at least one arithmetic caption in the row
 * separates them -- the month row has none.
 */
function stripAnchors(page) {
  const rows = groupRows(headerWords(page)).filter(r => r.words.length > 2);
  let best = null;

  for (const row of rows) {
    const hits = [];
    let formulas = 0;
    for (const w of row.words) {
      const fc = formulaColumn(w.text);
      if (fc !== null) {
        hits.push([fc, centre(w), w.y1]);
        formulas++;
      } else if (/^\d{1,2}$/.test(w.text) && Number(w.text) <= 14) {
        hits.push([Number(w.text), centre(w), w.y1]);
      }
    }
    if (!formulas) continue;

    // Column numbers ascend across the page; anything out of order is a figure
    // that wandered into the row, not a column number.
    const ordered = hits
      .sort((a, b) => a[1] - b[1])
      .filter(([n], i, xs) => i === 0 || n > xs[i - 1][0]);
    if (!best || ordered.length > best.hits.length)
      best = { hits: ordered, y1: row.y1 };
  }

  return best ?? { hits: [], y1: null };
}

/**
 * "1st" followed by "Quarter", and "March" followed by "31" -- the pairs, not
 * the words alone.
 *
 * Both halves matter. The ordinal alone also appears in the body of some pages;
 * the month alone is printed in the title ("As at the Quarter Ending December
 * 31, 2021"), where it sits over the wrong column entirely.
 */
function quarterAnchors(page) {
  const words = headerWords(page);
  const ordinals = {
    4: /^[1Il][s5]t$/i,
    5: /^2nd$/i,
    6: /^3rd$/i,
    7: /^4th$/i,
  };
  const months = {
    4: /^March$/i,
    5: /^June$/i,
    6: /^Sept\.?(ember)?$/i,
    7: /^Dec\.?(ember)?$/i,
  };

  /** The word to the right of `w`, on the same line and within a word's gap. */
  const rightOf = (w, re) =>
    words.find(
      o =>
        o !== w &&
        re.test(o.text) &&
        Math.abs(yCentre(o) - yCentre(w)) < w.y1 - w.y0 &&
        o.x0 >= w.x1 - 4 &&
        o.x0 - w.x1 < (w.y1 - w.y0) * 2
    );

  const out = [];
  for (const [col, re] of Object.entries(ordinals)) {
    const head = words.find(w => re.test(w.text));
    const tail = head && rightOf(head, /^Quarter$/i);
    if (tail)
      out.push([
        Number(col),
        (head.x0 + tail.x1) / 2,
        Math.max(head.y1, tail.y1),
      ]);
  }
  for (const [col, re] of Object.entries(months)) {
    const month = words.find(w => re.test(w.text) && w.y0 > page.height * 0.13);
    if (!month) continue;
    const day = rightOf(month, /^\d{1,2}[,.]?$/);
    out.push([
      Number(col),
      day ? (month.x0 + day.x1) / 2 : centre(month),
      day ? Math.max(month.y1, day.y1) : month.y1,
    ]);
  }
  return out;
}

/** Captions that name exactly one column each. */
function captionAnchors(page) {
  const words = headerWords(page);
  const named = [
    [3, [/^TARGET$/i, /^TARGEI$/i, /^\(?Annual\)?$/i, /^BESF$/i]],
    [9, [/^BT[r1l]$/i]],
    [10, [/^A[GO]DB$/i]],
    [14, [/^Remarks$/i, /^Kemarks?$/i]],
  ];

  const out = [];
  for (const [col, patterns] of named) {
    for (const re of patterns) {
      const w = words.find(x => re.test(x.text));
      if (w) {
        out.push([col, centre(w), w.y1]);
        break;
      }
    }
  }
  return out;
}

/**
 * Column centres for columns 3 to 13, in page pixels.
 *
 * Anchors from the four families are pooled per column and reduced by median,
 * which is what makes a single misread caption harmless. The result is then
 * forced to ascend by keeping its longest ascending run: an anchor that sits
 * left of the column before it named the wrong column, and one bad anchor
 * pulling the partition sideways would silently move figures between columns.
 *
 * Gaps are filled by linear interpolation between the surviving anchors, and
 * the ends by extending the nearest measured pitch. Column 14 -- the remarks --
 * is resolved too, because it is what closes the right-hand edge of the table.
 */
function columnCentres(page) {
  const strip = stripAnchors(page);
  const votes = new Map();
  const captionBottoms = [];
  const add = ([col, x, y1]) => {
    if (!votes.has(col)) votes.set(col, []);
    votes.get(col).push(x);
    if (Number.isFinite(y1)) captionBottoms.push(y1);
  };

  strip.hits.forEach(add);
  quarterAnchors(page).forEach(add);
  captionAnchors(page).forEach(add);

  const anchored = [...votes.entries()]
    .map(([col, xs]) => [col, median(xs)])
    .sort((a, b) => a[0] - b[0]);

  // Longest ascending run, by x. Ties in length keep the earlier run, which is
  // the one built from the leftmost -- and therefore most numerous -- anchors.
  let keep = [];
  for (let i = 0; i < anchored.length; i++) {
    const run = [anchored[i]];
    for (let j = i + 1; j < anchored.length; j++)
      if (anchored[j][1] > run[run.length - 1][1]) run.push(anchored[j]);
    if (run.length > keep.length) keep = run;
  }
  if (keep.length < 3) return null;

  const at = new Map(keep);
  const known = keep.map(([col]) => col);
  const centres = new Map(keep);

  // Interior gaps: the columns are not equally wide -- the target column is the
  // widest on every version of the form -- so interpolate between the anchors
  // either side rather than stepping by a single pitch.
  for (let col = known[0] + 1; col < known[known.length - 1]; col++) {
    if (at.has(col)) continue;
    const lo = known.filter(c => c < col).pop();
    const hi = known.find(c => c > col);
    centres.set(
      col,
      at.get(lo) + ((at.get(hi) - at.get(lo)) * (col - lo)) / (hi - lo)
    );
  }

  // Ends: extend the pitch measured over the run nearest that end.
  const spanPitch = (a, b) => (centres.get(b) - centres.get(a)) / (b - a);
  const first = known[0];
  const last = known[known.length - 1];
  const headPitch = spanPitch(first, Math.min(first + 3, last));
  const tailPitch = spanPitch(Math.max(last - 3, first), last);
  for (let col = first - 1; col >= 3; col--)
    centres.set(col, centres.get(col + 1) - headPitch);
  for (let col = last + 1; col <= 14; col++)
    centres.set(col, centres.get(col - 1) + tailPitch);

  const figures = layout.fields.map(f => centres.get(f.col));
  if (figures.some(c => !Number.isFinite(c))) return null;
  for (let i = 1; i < figures.length; i++)
    if (figures[i] <= figures[i - 1]) return null;

  return {
    centres: figures,
    remarksCentre: centres.get(14),
    anchored: known,
    // The table begins under the lowest caption that placed a column -- the
    // column-number strip where it survived, and otherwise whichever caption
    // sits lowest. Cutting on the header band as a whole instead would eat the
    // first rows of FY2024, whose stacked header reaches halfway down the page.
    bodyFrom:
      strip.y1 ?? (captionBottoms.length ? Math.max(...captionBottoms) : null),
  };
}

/**
 * Partition the page into one interval per figure column.
 *
 * A column's boundary is its neighbour's centre, not the midpoint between them.
 * That looks wrong and is not: every figure on this form is right-aligned, so
 * its right edge sits near the right-hand edge of its cell -- past the centre
 * of its own column, and short of the centre of the next one. Partitioning on
 * midpoints throws the widest figure in each column one place to the right,
 * which is how FY2021's revenue target first came out as its first-quarter
 * collection.
 *
 * Everything left of column 3's centre is the classification and the UACS code;
 * everything right of column 14's is the remarks column, which is prose and
 * must not be read as a figure.
 */
function boundsFrom(cols) {
  return [...cols.centres, cols.remarksCentre];
}

/* ------------------------------------------------------------------ rows -- */

/** Split cells OCR welded together, then reassemble numbers it split apart. */
const prepare = page =>
  groupRows(page.words).flatMap(r => mergeNumericFragments(r.words));

/** Parse a cell, attempting a recorded repair only if the raw text fails. */
function readCell(raw, { percent = false } = {}) {
  if (raw === null) return { value: null, method: 'missing', raw: null };

  if (percent) {
    const t = raw.replace(/\s/g, '');
    if (!PERCENT.test(t)) return { value: null, method: 'unreadable', raw };
    const negative = /^\(.*\)$/.test(t) || t.startsWith('-');
    const n = Number(t.replace(/[(),%-]/g, ''));
    return Number.isFinite(n)
      ? { value: negative ? -n : n, method: 'ocr', raw }
      : { value: null, method: 'unreadable', raw };
  }

  const v = parseMoney(raw);
  if (v.ok && v.value !== null) return { value: v.value, method: 'ocr', raw };
  if (v.ok && v.value === null) return { value: null, method: 'missing', raw };

  const cand = repairCandidates(raw)[0];
  if (cand)
    return {
      value: cand.value,
      method: 'ocr-repaired',
      raw,
      repairs: cand.repairs,
    };
  return { value: null, method: 'unreadable', raw };
}

/** Run the layout's arithmetic identities over one row. */
function checkRow(row) {
  const failures = [];
  let checked = 0;
  let rounding = 0;

  for (const c of layout.checks) {
    const lhs = row[c.lhs];
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

/**
 * What a row is, from its label.
 *
 * The form was redrawn in 2019. Before that it listed revenue under lettered
 * fund sections (A. General Fund, B. Special Account ...); after, under the
 * UACS revenue hierarchy (Internally Generated Funds > Revenue Collections >
 * Cash Receipts > Non-Tax > the sources themselves). Both shapes carry the same
 * line items underneath, and only those line items and the TOTAL are summed --
 * so the structural rows are labelled here and excluded from any total.
 */
const ROW_KIND = label => {
  const l = label.toUpperCase().replace(/\s+/g, ' ').trim();
  if (/^[A-D][.,)] /.test(l) || /^[A-D][.,)]$/.test(l)) return 'fund-section';
  if (/\bTOTAL\b/.test(l)) return 'total';
  if (
    /INTERNALLY GENERATED|REVENUE COLLECTIONS?|NON-?REVENUE|CASH RECEIPTS?|^NON-?TAX|^TAX$/.test(
      l
    )
  )
    return 'structural';
  return 'line';
};

/**
 * The revenue source a line item belongs to.
 *
 * The PSC's own wording drifts -- "Share from PAGCOR/ PCSO", "Share fiom
 * PAGCOR/PCSO", "Rent Income", "Rent/Lease Income" -- so these match on the
 * stem. Anything unrecognised stays null rather than being swept into "other";
 * an unclassified line is visible, a miscategorised one is not.
 */
const SOURCE = label => {
  const l = label.toLowerCase().replace(/\s+/g, ' ');
  if (/pagcor|pcso/.test(l)) return 'pagcor-pcso';
  if (/rent|lease/.test(l)) return 'rent';
  if (/affiliation/.test(l)) return 'affiliation-fees';
  if (/interest/.test(l)) return 'interest';
  if (/grant|donation/.test(l)) return 'grants-donations';
  if (/foreign exchange|forex/.test(l)) return 'forex';
  if (/miscellaneous|other gains|other service income|other income/.test(l))
    return 'other';
  if (/fines|penalt/.test(l)) return 'fines-penalties';
  if (/sale|proceeds/.test(l)) return 'sales';
  return null;
};

/**
 * "As at the Quarter Ending December 31, 2021" -> { period: 'Q4', year }, and
 * whether this page opens a statement or continues the one before it.
 *
 * The distinction decides what to do when the date line is unreadable. A
 * continuation page inherits the statement above it -- that is what it is. A
 * page that opens its own statement does not: FY2017's first-quarter statement
 * lost its date line to the scan, and inheriting would have filed its figures
 * under the second quarter, where they would have outvoted the real ones.
 */
function periodOf(page) {
  const text = page.lines.map(l => l.text).join(' ');
  const opensStatement = /REVENUE\s+AND\s+OTHER\s+REC/i.test(text);
  const m = text.match(
    /Quarter\s+Ending\s+([A-Za-z]+)\.?\s*(\d{1,2})?,?\s*(\d{4})/i
  );
  const q = m
    ? { mar: 'Q1', jun: 'Q2', sep: 'Q3', dec: 'Q4' }[
        m[1].slice(0, 3).toLowerCase()
      ]
    : null;
  return {
    opensStatement,
    period: q ? { period: q, year: Number(m[3]) } : null,
  };
}

/** Signature block, footer and header noise that survives the body cut. */
const NOT_A_ROW =
  /certified|approved|agency head|department secretary|authorized representative|chief|accountant|accounting division|^date|this report|page \d/i;

function extractPage(page, pageNo) {
  const cols = columnCentres(page);
  if (!cols)
    return {
      pageNo,
      extraction: 'failed',
      reason: 'no column anchors',
      rows: [],
    };

  const bounds = boundsFrom(cols);
  const merged = prepare(page);

  // The body starts below the column-number strip, which the form prints
  // immediately above its first data row. Where the strip did not survive OCR,
  // fall back to the lowest caption over the figure columns -- looser, because
  // the stacked header text reaches further down on some layouts than others.
  const headerBottom =
    cols.bodyFrom ??
    Math.max(
      ...headerWords(page)
        .filter(w => w.x0 > bounds[0])
        .map(w => w.y1),
      0
    );
  const body = merged.filter(w => w.y0 > headerBottom);

  const rows = [];
  // Rows sit about 37px apart at 300dpi and a single row's tokens scatter over
  // as much as 18px of that, because Vision snaps each word's box to its own
  // baseline. At the default tolerance the chain from one row reaches the next
  // and two lines are read as one -- which is how FY2021's rent and its PAGCOR
  // share first came out as a single row labelled "Share Rent/Lease from
  // PAGCOR". Tightening it splits the odd row in two instead, and a split row
  // is recoverable downstream where a merged one is not.
  for (const r of buildGrid(
    body,
    cols.centres.map(c => ({ right: c })),
    {
      bounds,
      gapFactor: 0.4,
    }
  )) {
    const label = r.label.replace(/\s+/g, ' ').trim();
    const filled = r.cells.filter(c => c !== null).length;
    if (!filled) continue;
    if (NOT_A_ROW.test(label)) continue;

    const row = {};
    const cells = {};
    FIELDS.forEach((key, i) => {
      const read = readCell(r.cells[i] ?? null, {
        percent: PERCENT_FIELDS.has(key),
      });
      row[key] = read.value;
      if (read.method !== 'ocr') cells[key] = read;
    });

    // A row with no readable figure at all is a caption fragment, not a row.
    if (FIELDS.every(k => row[k] === null)) continue;

    const check = checkRow(row);
    const uacs = label.match(/\b(\d{8,15})\b/);
    rows.push({
      page: pageNo,
      particulars: label
        .replace(/\b\d{8,15}\b/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
      rowKind: ROW_KIND(label),
      source: SOURCE(label),
      uacsCode: uacs ? uacs[1] : null,
      ...row,
      provenance: {
        method: Object.keys(cells).length ? 'ocr-repaired' : 'ocr',
        checks: check.status,
        checkFailures: check.failures.length ? check.failures : undefined,
        cells: Object.keys(cells).length ? cells : undefined,
        collisions: r.collisions.length ? r.collisions : undefined,
        bbox: [Math.round(r.y0), Math.round(r.y1)],
      },
    });
  }

  const figureCols = layout.fields.map(f => f.col);
  return {
    pageNo,
    extraction: 'complete',
    anchored: cols.anchored.filter(c => figureCols.includes(c)),
    interpolated: layout.fields
      .filter(f => !cols.anchored.includes(f.col))
      .map(f => f.key),
    rows,
  };
}

async function extract(docId) {
  const file = path.join(OCR, `${docId}.ndjson`);
  if (!existsSync(file)) return { docId, error: 'no OCR output' };

  const pages = (await readFile(file, 'utf8'))
    .trim()
    .split('\n')
    .map(l => JSON.parse(l));

  const pageMeta = [];
  const rows = [];

  // The period is printed on the first page of each statement; a continuation
  // page repeats it, and when the scan has dropped it the page belongs to the
  // statement above it.
  let current = null;

  for (const [i, page] of pages.entries()) {
    const { period: p, opensStatement } = periodOf(page);
    if (p) current = p;
    else if (opensStatement) current = null;

    const out = extractPage(page, i + 1);
    pageMeta.push({
      page: i + 1,
      period: current?.period ?? null,
      extraction: out.extraction,
      reason: out.reason,
      anchored: out.anchored?.length,
      interpolated: out.interpolated?.length ? out.interpolated : undefined,
      rows: out.rows.length,
    });

    for (const r of out.rows)
      rows.push({
        docId,
        period: current?.period ?? null,
        fiscalYear: current?.year ?? null,
        ...r,
      });
  }

  const tally = k => rows.filter(r => r.provenance.checks === k).length;
  return {
    docId,
    generatedAt: new Date().toISOString(),
    layout: 'far5',
    pages: pageMeta,
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
  const ids = (ONLY ? [ONLY] : files.map(f => f.replace(/\.ndjson$/, '')))
    .filter(id => id.startsWith('far5'))
    .sort();

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
    const checkable = s.pass + s.passRounding + s.fail;
    const rate = checkable
      ? (((s.pass + s.passRounding) / checkable) * 100).toFixed(0)
      : '--';
    console.log(
      `${docId.padEnd(16)} ${String(s.rows).padStart(3)} rows | pass ${String(s.pass).padStart(3)}` +
        ` +${String(s.passRounding).padStart(2)} rounding | fail ${String(s.fail).padStart(3)}` +
        ` | n/a ${String(s.notApplicable).padStart(3)} | ${rate.padStart(3)}%` +
        `  [${result.pages.map(p => (p.extraction === 'complete' ? p.rows : 'X')).join('/')}]`
    );

    if (VERBOSE) {
      for (const r of result.rows.filter(r => r.provenance.checks === 'fail'))
        console.log(
          `    p${r.page} ${r.period} ${r.particulars.slice(0, 28).padEnd(29)} ` +
            r.provenance.checkFailures
              .map(f => `${f.rule.split(' =')[0]} Δ${f.delta.toLocaleString()}`)
              .join('; ')
        );
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
