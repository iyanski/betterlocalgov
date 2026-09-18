/**
 * Stage 0 - build the document catalogue for the PSC Transparency Seal.
 *
 * Consumes  data/catalog/links.raw.json   (browser/harvest-links.js output)
 *           data/catalog/section-runs.json (roman-section run lengths)
 * Emits     data/catalog/documents.json    COMMITTED
 *
 * Idempotent. A diff in documents.json is the signal that the PSC changed its
 * seal page -- that is the point of committing it.
 *
 * Usage:  node scripts/psc-data/00-catalog.mjs [--verbose]
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const CATALOG = path.join(ROOT, 'data/catalog');
const VERBOSE = process.argv.includes('--verbose');

/**
 * The seal page is littered with zero-width spaces -- several year labels are
 * literally "FY 2\u200B024". They must be DELETED, not turned into spaces, or
 * "FY 2024" parses as the year 2 followed by 024.
 */
const clean = s =>
  String(s || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** A 4-digit year not embedded in a longer digit run. \b is no good here: the
 *  label "APPNonCSE2023" has a letter before the digits, so there is no word
 *  boundary to anchor on. */
const YEAR = /(?<!\d)((?:19|20)\d{2})(?!\d)/;

/** Subsection heading -> series, for the sections with one series each. */
const SUBSECTION_SERIES = [
  [/FAR\s*No\.?\s*1|SAAOBDB|SAAODB/i, 'far1'],
  [/Summary\s+Report\s+on\s+Disbursements/i, 'far4'],
  [/BAR\s*NO\.?\s*1|Physical\s+Report\s+of\s+Operations/i, 'bar1'],
  [/FAR\s*NO\.?\s*5|Revenue\s+and\s+Other\s+Receipts/i, 'far5'],
  [/Financial\s+Plan/i, 'financial-plan'],
  [/PSC\s+Budget/i, 'psc-budget'],
  [/Targets\s*\/\s*MFOs/i, 'targets-mfo'],
  [/Projects\s*&\s*Programs/i, 'programs'],
  [/Status\s+of\s+Implementation/i, 'status-of-implementation'],
];

/**
 * Section V lumps every procurement artefact under a per-year heading, so the
 * series has to come off the document label itself. Order matters: APP-CSE and
 * APP-Non-CSE must be tested before the generic APP.
 */
const PROCUREMENT_SERIES = [
  [/Monitoring\s+Report|PMR\b/i, 'pmr'],
  [/APCPI/i, 'apcpi'],
  [
    /Certification|Posting\s+Certification|Early\s+Procurement/i,
    'app-certification',
  ],
  [/Non[-\s]?CSE/i, 'app-non-cse'],
  [/CSE|Common[-\s]?Use\s+Supplies/i, 'app-cse'],
  [/APP|Annual\s+Procurement\s+Plan/i, 'app'],
];

/** Sections that carry a single series regardless of label. */
const SECTION_SERIES = {
  VI: 'iso',
  VII: 'ranking-delivery-units',
  VIII: 'saln-review',
  IX: 'foi',
  X: 'citizens-charter',
  XI: 'pbb',
  XII: 'arta',
};

/**
 * Scope, per the project decision: the financial core, procurement, and
 * programs/governance. ISO certificates and the Citizen's Charter carry no
 * chartable data and are catalogued but not extracted.
 */
const IN_SCOPE = new Set([
  'far1',
  'far4',
  'far5',
  'bar1',
  'financial-plan',
  'psc-budget',
  'targets-mfo',
  'programs',
  'status-of-implementation',
  'app',
  'app-cse',
  'app-non-cse',
  'app-certification',
  'pmr',
  'apcpi',
  'foi',
  'pbb',
]);

function detectSeries(label, subsection, roman) {
  const sub = clean(subsection);
  for (const [re, series] of SUBSECTION_SERIES) if (re.test(sub)) return series;
  if (roman === 'V') {
    const l = clean(label);
    for (const [re, series] of PROCUREMENT_SERIES)
      if (re.test(l)) return series;
    return 'app';
  }
  return SECTION_SERIES[roman] || 'misc';
}

/**
 * Fiscal year. The label wins when it names one ("FY 2024", "CY 2025"); the
 * upload path is the fallback, but a WordPress upload path is the year the file
 * was POSTED, which for a 4th-quarter report is the following year -- so it is
 * only trusted when the label says nothing, and it is recorded as low
 * confidence.
 */
function detectFiscalYear(label, href) {
  const l = clean(label);
  const m =
    l.match(/(?:FY|CY)\s*\.?\s*((?:19|20)\d{2})(?!\d)/i) || l.match(YEAR);
  if (m) return { fiscalYear: +m[1], yearFrom: 'label' };

  const file = clean(decodeURIComponent(href).split('/').pop() || '');
  const f = file.match(YEAR);
  if (f) return { fiscalYear: +f[1], yearFrom: 'filename' };

  const p = decodeURIComponent(href).match(/\/((?:19|20)\d{2})\/\d{2}\//);
  if (p) return { fiscalYear: +p[1], yearFrom: 'upload-path' };

  return { fiscalYear: null, yearFrom: null };
}

/**
 * Quarter/semester, almost always encoded in the filename rather than the
 * label. \b is useless as a left anchor here because the separator is usually
 * an underscore, which is itself a word character: "FY2026_2ndQ_FAR-No.-1.pdf"
 * has no boundary before the 2. Anchor on start-or-non-alphanumeric instead.
 */
// Written-out ordinals only. A bare digit is far too greedy: "BAR 1 - q4" would
// match the "1" and be read as the first quarter. The only guard the written
// forms need is "not preceded by a digit", which lets them match inside
// run-together filenames like "FinancialReportofOperation4thQuarterFY2023".
const ORDINAL = {
  Q1: '1st|first',
  Q2: '2nd|second',
  Q3: '3rd|third',
  Q4: '4th|fourth',
};

function detectPeriod(label, href) {
  const hay =
    clean(label) + ' ' + clean(decodeURIComponent(href).split('/').pop() || '');

  // Highest quarter wins. FARs are cumulative, so a "1st-4th quarter" report
  // ("FAR5_1ST4THQUARTER.pdf") covers exactly the same span as a 4th-quarter
  // one -- both are the full year through Q4.
  for (const period of ['Q4', 'Q3', 'Q2', 'Q1']) {
    const n = period[1];
    const written = new RegExp(
      `(?<!\\d)(?:${ORDINAL[period]})[\\s._-]*(?:Q\\b|Q[^A-Za-z]|Quarter|qtr)`,
      'i'
    );
    // Both orderings occur in the wild: "FAR1_4q.pdf" and "FAR1 - q4.pdf".
    const digits = new RegExp(
      `(?<![A-Za-z0-9])(?:Q\\s*${n}(?!\\d)|${n}\\s*Q(?![A-Za-z]))`,
      'i'
    );
    if (written.test(hay) || digits.test(hay)) return period;
  }

  if (/(?<!\d)(?:1st|first)[\s._-]*Sem/i.test(hay)) return 'S1';
  if (/(?<!\d)(?:2nd|second)[\s._-]*Sem/i.test(hay)) return 'S2';
  return 'FY';
}

/** Marks a plan revision so the APP version chain survives into the data. */
function detectVariant(label) {
  const l = clean(label);
  if (/Supplemental/i.test(l)) return 'supplemental';
  if (/Updated|Update\b/i.test(l)) return 'updated';
  if (/Indicative/i.test(l)) return 'indicative';
  return null;
}

async function main() {
  const raw = JSON.parse(
    await readFile(path.join(CATALOG, 'links.raw.json'), 'utf8')
  );
  const sections = JSON.parse(
    await readFile(path.join(CATALOG, 'section-runs.json'), 'utf8')
  );

  const expanded = [];
  for (const [roman, count] of sections.runs) {
    for (let i = 0; i < count; i++) expanded.push(roman);
  }
  if (expanded.length !== raw.links.length) {
    throw new Error(
      `section-runs covers ${expanded.length} links but links.raw.json has ${raw.links.length}; re-harvest both together`
    );
  }

  const seen = new Map();
  const docs = [];

  raw.links.forEach((link, i) => {
    const roman = expanded[i];
    const href = link.href;

    // The nearest heading recorded by the harvester is the lettered subsection
    // when there is one, and the roman section itself otherwise.
    const nearest = clean(link.sealSection);
    const isRomanHeading = /^[IVXLC]+\s*\./.test(nearest);
    const subsection = isRomanHeading ? null : nearest || null;

    const series = detectSeries(link.label, subsection, roman);
    const { fiscalYear, yearFrom } = detectFiscalYear(link.label, href);
    const period = detectPeriod(link.label, href);
    const variant = detectVariant(link.label);

    const parts = [series, fiscalYear ?? 'unknown'];
    if (period && period !== 'FY') parts.push(period.toLowerCase());
    if (variant) parts.push(variant);
    let docId = parts.join('-');

    // Several documents legitimately share series+year+period (an APP and its
    // posting certification, a scorecard and its isolation letter). Suffix
    // rather than collide -- the manifest has to round-trip one row per link.
    const n = (seen.get(docId) || 0) + 1;
    seen.set(docId, n);
    if (n > 1) docId = `${docId}-${n}`;

    const url = new URL(href);

    docs.push({
      docId,
      series,
      inScope: IN_SCOPE.has(series),
      title: clean(link.label) || clean(subsection) || docId,
      sealSection: roman,
      sealSectionTitle: sections.titles[roman] || null,
      subsection,
      fiscalYear,
      yearFrom,
      period,
      variant,
      sourceUrl: href,
      host: url.host,
      // The pre-2017 documents point at a host that was retired; the catalogue
      // records the expectation, stage 1 records what actually happened.
      expectedDead: url.host !== 'psc.gov.ph',
      order: i,
    });
  });

  const out = {
    generatedAt: new Date().toISOString(),
    harvestedAt: raw.harvestedAt,
    pageUrl: raw.pageUrl,
    counts: {
      links: docs.length,
      uniqueUrls: new Set(docs.map(d => d.sourceUrl)).size,
      inScope: docs.filter(d => d.inScope).length,
      expectedDead: docs.filter(d => d.expectedDead).length,
    },
    documents: docs,
  };

  await writeFile(
    path.join(CATALOG, 'documents.json'),
    JSON.stringify(out, null, 2) + '\n'
  );

  const bySeries = {};
  for (const d of docs) {
    const k = `${d.series}${d.inScope ? '' : ' (out of scope)'}`;
    bySeries[k] = (bySeries[k] || 0) + 1;
  }
  console.log(
    `catalogued ${docs.length} links (${out.counts.uniqueUrls} unique URLs)`
  );
  console.log(
    `  in scope: ${out.counts.inScope}   expected dead: ${out.counts.expectedDead}`
  );
  for (const [k, v] of Object.entries(bySeries).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(v).padStart(3)}  ${k}`);
  }

  const noYear = docs.filter(d => d.inScope && d.fiscalYear === null);
  if (noYear.length) {
    console.warn(`\n${noYear.length} in-scope documents have no fiscal year:`);
    for (const d of noYear)
      console.warn(`  ${d.series}  ${JSON.stringify(d.title)}`);
  }
  if (VERBOSE) {
    for (const d of docs) {
      console.log(
        `${d.docId.padEnd(38)} ${String(d.fiscalYear).padStart(4)} ${d.period.padEnd(2)} ${d.yearFrom || '-'}  ${d.title.slice(0, 50)}`
      );
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
