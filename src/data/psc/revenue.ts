/**
 * The PSC's revenue, FY2017 to date, as read from FAR No. 5.
 *
 * The figures are not typed in here. They come from data/derived/revenue/
 * series.json, which the pipeline builds from the agency's own quarterly
 * Reports of Revenue and Other Receipts -- ten scanned PDFs, thirty-seven pages
 * -- and rebuilds whenever a new quarter is published. What this file adds is
 * the types the page reads them through, and the handful of quantities the
 * story argues from.
 *
 * Read `scripts/psc-data/07-far5.mjs` and `08-revenue.mjs` for how a scan
 * becomes a number, and `votes`/`of` on any figure below for how many
 * independent readings of the agency's own documents agreed on it.
 */
import series from '../../../data/derived/revenue/series.json';

/** A figure, with the count of independent readings that produced it. */
export interface Figure {
  value: number;
  /** Readings that agreed. 0 means the figure was calculated, not read. */
  votes: number;
  /** Readings taken. */
  of: number;
  contested?: boolean;
  /**
   * `reported` -- printed in the document.
   * `quarters` -- the four quarters added up, because the scan lost the total.
   * `derived` -- the one missing quarter under a printed total.
   */
  basis?: 'reported' | 'quarters' | 'derived';
}

export type QuarterKey = 'q1' | 'q2' | 'q3' | 'q4';
export type Quarters = Record<QuarterKey, Figure | null>;

export interface RevenueSource {
  key: string;
  label: string;
  target: Figure | null;
  quarters: Quarters;
  total: Figure | null;
  totalFromQuarters: number | null;
}

export interface RevenueYear {
  fiscalYear: number;
  docId: string;
  /** The last quarter the year's documents cover. 'Q2' means half a year. */
  through: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  statements: number;
  target: Figure | null;
  quarters: Quarters;
  total: Figure | null;
  totalFromQuarters: number | null;
  sources: RevenueSource[];
  unclassified: string[];
  checks: { rule: string; pass: boolean; delta: number }[];
  document: {
    title: string;
    sourceUrl: string;
    pages: number;
    sha256: string;
    retrievedAt: string;
  } | null;
}

export const QUARTERS: QuarterKey[] = ['q1', 'q2', 'q3', 'q4'];

export const years = series.years as unknown as RevenueYear[];

/** Years with all four quarters in. FY2026 is half-reported and excluded. */
export const fullYears = years.filter(y => y.through === 'Q4');

/** The part-year at the end of the series, if the latest document is one. */
export const partYear = years.find(y => y.through !== 'Q4') ?? null;

export const generatedAt = series.generatedAt;
export const documentCount = series.documents;

const value = (f: Figure | null | undefined) => (f ? f.value : null);

export const targetOf = (y: RevenueYear) => value(y.target);
export const collectedOf = (y: RevenueYear) => value(y.total);

export const sourceOf = (y: RevenueYear, key: string) =>
  y.sources.find(s => s.key === key) ?? null;

/** The PAGCOR and PCSO share, which is almost the whole of the agency's income. */
export const gamblingOf = (y: RevenueYear) =>
  value(sourceOf(y, 'pagcor-pcso')?.total);

/** Everything that is not the gambling share, as one figure. */
export function otherOf(y: RevenueYear): number | null {
  const total = collectedOf(y);
  const gambling = gamblingOf(y);
  return total === null || gambling === null
    ? null
    : Math.round((total - gambling) * 100) / 100;
}

/** The gambling share as a percentage of collections. */
export function gamblingShare(y: RevenueYear): number | null {
  const total = collectedOf(y);
  const gambling = gamblingOf(y);
  return total && gambling !== null ? (gambling / total) * 100 : null;
}

/** Collections against the BESF target, as a percentage. A miss is negative. */
export function varianceShare(y: RevenueYear): number | null {
  const total = collectedOf(y);
  const target = targetOf(y);
  return total !== null && target ? ((total - target) / target) * 100 : null;
}

/** Every quarter in the series, oldest first, for the long trend. */
export const quarterly = years.flatMap(y =>
  QUARTERS.map((q, i) => ({
    /** FY2019 Q3 becomes 2019.5, so the x-axis spaces quarters evenly. */
    x: y.fiscalYear + i / 4,
    fiscalYear: y.fiscalYear,
    quarter: q.toUpperCase(),
    value: value(y.quarters[q]),
  }))
);

/**
 * The revenue sources the series has ever recorded, in the order the page
 * shows them: the gambling share first, then the rest by what they brought in.
 *
 * Totalled over the FULL years only. A half-reported year in the total would
 * make the source shares add up to more than the collections they are shares
 * of, which is the sort of quiet arithmetic error this site exists to notice.
 */
export const sourceKeys = (() => {
  const totals = new Map<string, { label: string; total: number }>();
  for (const y of fullYears)
    for (const s of y.sources) {
      const at = totals.get(s.key) ?? { label: s.label, total: 0 };
      at.total += value(s.total) ?? 0;
      totals.set(s.key, at);
    }
  return [...totals.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .map(([key, v]) => ({ key, label: v.label, total: v.total }));
})();

/** The most revenue sources the form has ever carried in one year. */
export const mostSourcesInAYear = Math.max(...years.map(y => y.sources.length));

/** Totals over the fully reported years, for the hero. */
export const decade = {
  from: fullYears[0].fiscalYear,
  to: fullYears[fullYears.length - 1].fiscalYear,
  collected: fullYears.reduce((a, y) => a + (collectedOf(y) ?? 0), 0),
  gambling: fullYears.reduce((a, y) => a + (gamblingOf(y) ?? 0), 0),
  target: fullYears.reduce((a, y) => a + (targetOf(y) ?? 0), 0),
};

export const decadeShare = (decade.gambling / decade.collected) * 100;

/** Years whose collections came in under the agency's own target. */
export const yearsUnderTarget = fullYears.filter(y => {
  const v = varianceShare(y);
  return v !== null && v < 0;
});

/** The deepest year-on-year fall in collections, which is the COVID one. */
export const steepestFall = (() => {
  let worst: { from: RevenueYear; to: RevenueYear; change: number } | null =
    null;
  for (let i = 1; i < fullYears.length; i++) {
    const a = collectedOf(fullYears[i - 1]);
    const b = collectedOf(fullYears[i]);
    if (a === null || b === null || a === 0) continue;
    const change = ((b - a) / a) * 100;
    if (!worst || change < worst.change)
      worst = { from: fullYears[i - 1], to: fullYears[i], change };
  }
  return worst;
})();

/** How many readings back the series, for the note on method. */
export const readings = years.reduce(
  (a, y) =>
    a +
    (y.target?.of ?? 0) +
    QUARTERS.reduce((b, q) => b + (y.quarters[q]?.of ?? 0), 0) +
    (y.total?.of ?? 0) +
    y.sources.reduce(
      (b, s) =>
        b +
        (s.target?.of ?? 0) +
        (s.total?.of ?? 0) +
        QUARTERS.reduce((c, q) => c + (s.quarters[q]?.of ?? 0), 0),
      0
    ),
  0
);
