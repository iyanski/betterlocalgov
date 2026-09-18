/**
 * Reconcile FAR No. 5 into one revenue series, FY2017 to date.
 *
 * Consumes  data/derived/far5/*.json                 (stage 07)
 * Emits     data/derived/revenue/series.json         COMMITTED
 *
 * Every figure on this page is read off a scan, and some of those scans are
 * poor. What makes the series trustworthy anyway is that the PSC reports the
 * same figure many times over: each annual PDF contains four statements -- one
 * per quarter ending, each cumulative from January -- so a first-quarter
 * collection is printed four times in four different scans of four different
 * pages. On top of that the form repeats every total down its own hierarchy
 * (Internally Generated Funds = Revenue Collections = Cash Receipts = Non-Tax =
 * TOTAL), which is another four to five printings of the same number.
 *
 * So each figure here is a vote among independent readings. The value reported
 * is the one most readings agree on, and the count of agreeing readings travels
 * with it. A figure read once, from one degraded scan, is marked as such rather
 * than being quietly averaged into something that looks like the rest.
 *
 * Usage:
 *   node scripts/psc-data/08-revenue.mjs [--verbose]
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const IN = path.join(ROOT, 'data/derived/far5');
const MANIFEST = path.join(ROOT, 'data/manifest/manifest.json');
const OUT = path.join(ROOT, 'data/derived/revenue');
const VERBOSE = process.argv.includes('--verbose');

const QUARTERS = ['q1', 'q2', 'q3', 'q4'];
const ORDER = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };

/**
 * The source labels, in the order the story reads them.
 *
 * "other" collects the form's own residual lines -- miscellaneous income, other
 * gains, foreign-exchange gains -- which are separate rows on some years and one
 * row on others. Everything else keeps its own identity across the whole series.
 */
const SOURCES = [
  { key: 'pagcor-pcso', label: 'Share from PAGCOR and PCSO' },
  { key: 'rent', label: 'Rent and lease income' },
  { key: 'grants-donations', label: 'Grants and donations' },
  { key: 'interest', label: 'Interest income' },
  { key: 'affiliation-fees', label: 'Affiliation fees' },
  { key: 'sales', label: 'Sale of unserviceable property' },
  { key: 'forex', label: 'Gain on foreign exchange' },
  { key: 'fines-penalties', label: 'Fines and penalties' },
  { key: 'other', label: 'Miscellaneous and other gains' },
];

/**
 * The winner of a vote, with the count behind it.
 *
 * Money is compared to the centavo after rounding, so two readings agree only
 * if they are the same figure -- not merely close. A near-miss is a misread
 * digit, and treating it as agreement would launder exactly the error this
 * whole arrangement exists to catch.
 *
 * A reading from a row that balances counts double. Four readings of FY2020's
 * PAGCOR target disagreed three ways, one per statement, so a plain count came
 * down to which statement happened to sort first -- and picked a figure a
 * decimal order of magnitude out. The row it came from did not balance; the row
 * carrying the right figure did.
 */
const BALANCED = new Set(['pass', 'pass-rounding']);

function vote(readings) {
  const weights = new Map();
  const counts = new Map();

  for (const { value, checks } of readings) {
    if (value === null || value === undefined) continue;
    const k = Math.round(value * 100);
    weights.set(k, (weights.get(k) ?? 0) + (BALANCED.has(checks) ? 2 : 1));
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  if (!weights.size) return null;

  const ranked = [...weights.entries()].sort((a, b) => b[1] - a[1]);
  const [key, weight] = ranked[0];
  return {
    value: key / 100,
    votes: counts.get(key),
    of: [...counts.values()].reduce((a, b) => a + b, 0),
    contested: ranked.length > 1 && ranked[1][1] === weight,
  };
}

/** The readings of one field, tagged with whether their row balanced. */
const readings = (rows, field) =>
  rows.map(r => ({ value: r[field], checks: r.provenance.checks }));

const val = v => (v ? v.value : null);

/** Statements in one document, newest quarter first, each with its rows. */
function statements(doc) {
  const byPeriod = new Map();
  for (const row of doc.rows) {
    if (!row.period) continue;
    if (!byPeriod.has(row.period)) byPeriod.set(row.period, []);
    byPeriod.get(row.period).push(row);
  }
  return [...byPeriod.entries()]
    .map(([period, rows]) => ({ period, rows }))
    .sort((a, b) => ORDER[b.period] - ORDER[a.period]);
}

/**
 * Read one document into a year.
 *
 * Quarter figures are voted across every statement that covers that quarter --
 * a third-quarter collection appears on the Q3 and Q4 statements and nowhere
 * else -- and the year's own total is taken only from the last statement, since
 * the earlier ones total the year so far rather than the year.
 */
function reconcile(doc) {
  const stmts = statements(doc);
  if (!stmts.length) return null;

  const fiscalYear = doc.rows.find(r => r.fiscalYear)?.fiscalYear ?? null;
  const through = stmts[0].period;

  /** Rows that carry a whole-agency figure: the TOTAL and the hierarchy above it. */
  const totalRows = s =>
    s.rows.filter(r => r.rowKind === 'total' || r.rowKind === 'structural');
  const sourceRows = (s, key) => s.rows.filter(r => r.source === key);

  const collect = (pick, field, minPeriod = null) =>
    vote(
      stmts
        .filter(s => !minPeriod || ORDER[s.period] >= ORDER[minPeriod])
        .flatMap(s => readings(pick(s), field))
    );

  const quarterOf = (pick, q) => {
    const v = collect(pick, q, `Q${QUARTERS.indexOf(q) + 1}`);
    return v && { ...v, basis: 'reported' };
  };

  /**
   * One line of the series -- the agency as a whole, or one revenue source.
   *
   * The year's total is taken from the last statement only, since the earlier
   * three total the year so far rather than the year. Where the scan lost that
   * column the quarters stand in for it, and the result says which of the two
   * it is: a printed figure and a figure we added up are not the same claim.
   */
  const seriesFor = pick => {
    const quarters = Object.fromEntries(
      QUARTERS.map(q => [q, quarterOf(pick, q)])
    );
    const covered = QUARTERS.slice(0, ORDER[through]);
    const reported = vote(readings(pick(stmts[0]), 'total'));

    // One quarter missing under a printed total is not missing: the form's own
    // column 8 supplies it. FY2017's third quarter and FY2026's second were
    // both lost to the scan, and both come back to the centavo this way. Two
    // missing quarters are left missing -- there is nothing to separate them.
    const absent = covered.filter(q => val(quarters[q]) === null);
    if (absent.length === 1 && reported) {
      const rest = covered
        .filter(q => q !== absent[0])
        .reduce((a, q) => a + val(quarters[q]), 0);
      quarters[absent[0]] = {
        value: Math.round((reported.value - rest) * 100) / 100,
        votes: 0,
        of: 0,
        basis: 'derived',
      };
    }

    const summed = covered.every(q => val(quarters[q]) !== null)
      ? Math.round(covered.reduce((a, q) => a + val(quarters[q]), 0) * 100) /
        100
      : null;

    const total =
      reported ?? (summed === null ? null : { value: summed, votes: 0, of: 0 });

    return {
      target: collect(pick, 'target'),
      quarters,
      total: total && {
        ...total,
        basis: total.basis ?? (reported ? 'reported' : 'quarters'),
      },
      totalFromQuarters: summed,
    };
  };

  const agency = seriesFor(totalRows);
  const sources = SOURCES.map(s => ({
    key: s.key,
    label: s.label,
    ...seriesFor(st => sourceRows(st, s.key)),
  })).filter(
    s =>
      val(s.total) !== null ||
      val(s.target) !== null ||
      QUARTERS.some(q => val(s.quarters[q]) !== null)
  );

  // Unclassified line items, kept visible: a line the classifier did not
  // recognise is a hole in the breakdown, and the page says so rather than
  // letting the sources quietly fail to add up.
  const unclassified = [
    ...new Set(
      doc.rows
        .filter(
          r =>
            r.rowKind === 'line' &&
            !r.source &&
            r.particulars &&
            // A label with figures in it is a row the scan mangled, not a
            // revenue source the classifier has never seen.
            !/\d/.test(r.particulars)
        )
        .map(r => r.particulars.replace(/\s+/g, ' ').trim())
    ),
  ];

  return {
    fiscalYear,
    docId: doc.docId,
    through,
    statements: stmts.length,
    target: agency.target,
    quarters: agency.quarters,
    total: agency.total,
    totalFromQuarters: agency.totalFromQuarters,
    sources,
    unclassified,
  };
}

/** The identities the reconciled year is expected to satisfy. */
function auditYear(year) {
  const checks = [];
  const near = (a, b, tol = 1) =>
    a !== null && b !== null && Math.abs(a - b) <= tol;

  const total = val(year.total);
  const target = val(year.target);

  if (total !== null && year.totalFromQuarters !== null)
    checks.push({
      rule: 'total = sum of quarters',
      pass: near(total, year.totalFromQuarters),
      delta: Math.round((total - year.totalFromQuarters) * 100) / 100,
    });

  const sourcesTotal = year.sources.reduce(
    (a, s) => (a === null || val(s.total) === null ? null : a + val(s.total)),
    0
  );
  if (total !== null && sourcesTotal !== null)
    checks.push({
      rule: 'total = sum of sources',
      pass: near(total, sourcesTotal, 1),
      delta: Math.round((total - sourcesTotal) * 100) / 100,
    });

  const sourcesTarget = year.sources.reduce(
    (a, s) => (a === null || val(s.target) === null ? null : a + val(s.target)),
    0
  );
  if (target !== null && sourcesTarget !== null)
    checks.push({
      rule: 'target = sum of source targets',
      pass: near(target, sourcesTarget, 1),
      delta: Math.round((target - sourcesTarget) * 100) / 100,
    });

  return checks;
}

async function main() {
  const files = (await readdir(IN)).filter(f => f.endsWith('.json')).sort();
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
  const years = [];

  for (const f of files) {
    const doc = JSON.parse(await readFile(path.join(IN, f), 'utf8'));
    const year = reconcile(doc);
    if (!year) continue;
    year.checks = auditYear(year);

    // Carry the document's own identity through to the page, so a reader can
    // open the scan the figures were read from and check them.
    const m = manifest.documents.find(d => d.docId === year.docId);
    year.document = m
      ? {
          title: m.title,
          sourceUrl: m.sourceUrl,
          pages: m.pages,
          sha256: m.sha256,
          retrievedAt: m.retrievedAt ?? manifest.generatedAt,
        }
      : null;

    years.push(year);
  }

  years.sort((a, b) => a.fiscalYear - b.fiscalYear);

  await mkdir(OUT, { recursive: true });
  await writeFile(
    path.join(OUT, 'series.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: 'FAR No. 5 (Quarterly Report of Revenue and Other Receipts)',
        documents: files.length,
        years,
      },
      null,
      2
    ) + '\n'
  );

  for (const y of years) {
    const t = val(y.total);
    const g = y.sources.find(s => s.key === 'pagcor-pcso');
    const failed = y.checks.filter(c => !c.pass);
    console.log(
      `FY${y.fiscalYear} through ${y.through} | target ${fmt(val(y.target))} | collected ${fmt(t)}` +
        ` | PAGCOR/PCSO ${fmt(val(g?.total))}` +
        ` | ${y.statements} statements` +
        (failed.length
          ? ` | ${failed.map(c => `${c.rule} Δ${c.delta.toLocaleString()}`).join('; ')}`
          : ' | balances')
    );
    if (VERBOSE) {
      for (const q of QUARTERS) {
        const v = y.quarters[q];
        console.log(
          `    ${q} ${fmt(val(v))}${v ? `  (${v.votes}/${v.of} readings agree${v.contested ? ', CONTESTED' : ''})` : ''}`
        );
      }
      if (y.unclassified.length)
        console.log(`    unclassified: ${y.unclassified.join(' | ')}`);
    }
  }
}

const fmt = v =>
  v === null || v === undefined
    ? '           --'
    : v.toLocaleString('en-US', { maximumFractionDigits: 0 }).padStart(13);

main().catch(err => {
  console.error(err);
  process.exit(1);
});
