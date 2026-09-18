/**
 * The manifest, reduced to the handful of numbers the /data pages actually
 * quote.
 *
 * The index could import the manifest itself, but that is 150 KB of JSON
 * shipped to a browser to render a dozen counts -- and the whole manifest
 * belongs on /data/sources, fetched on demand, not in the entry path of every
 * data page.
 *
 * `findings` is the part that matters. The /data index makes claims about the
 * shape of the PSC's archive -- that nothing before FY2017 resolves, that the
 * only 404s on the live site are procurement documents, that no two of these
 * PDFs were produced the same way -- and a claim typed into a JSX file is a
 * claim that stops being true the first time the agency fixes a link. Deriving
 * them here means the page rewrites itself on the next ingest run, or says
 * plainly that the gap has closed.
 */

/** Documents whose absence is the PSC's, not ours: promised by the seal, not delivered. */
const isMissing = r => r.inScope && r.status !== 'live';

/** Series that describe what the agency buys, as opposed to what it spends or reports. */
const PROCUREMENT = new Set([
  'app',
  'app-cse',
  'app-non-cse',
  'app-certification',
  'pmr',
  'apcpi',
]);

/** How a form is named in prose, for the series the /data pages talk about. */
const SERIES_LABEL = {
  far1: 'FAR No. 1',
  far4: 'FAR No. 4',
  far5: 'FAR No. 5',
  bar1: 'BAR No. 1',
};

const range = ns => ({ firstYear: Math.min(...ns), lastYear: Math.max(...ns) });
const uniq = xs => [...new Set(xs)];

/**
 * Distinct values of `field` within each of `series`, as a count.
 *
 * Used for the one statistic that says most about how these documents are
 * made: FAR No. 1 is a single form, filed to the same template every year, and
 * ten years of it arrive on ten different sizes of paper.
 */
const spread = (rows, series, field) =>
  series
    .map(s => {
      const docs = rows.filter(r => r.series === s && r.status === 'live');
      return {
        series: s,
        label: SERIES_LABEL[s] ?? s,
        documents: docs.length,
        distinct: uniq(docs.map(r => r[field] ?? null)).length,
      };
    })
    .filter(x => x.documents > 0);

export function summarize(rows) {
  const live = rows.filter(r => r.status === 'live');
  const missing = rows.filter(isMissing);
  const years = rows.map(r => r.fiscalYear).filter(Boolean);

  // A host the agency retired takes its whole era with it: every document on
  // it is gone at once, and the gap is a date range rather than a scatter.
  const retiredRows = missing.filter(r => r.status === 'not-fetched');
  const deadRows = missing.filter(r => r.status === 'dead');

  const inScope = rows.filter(r => r.inScope);
  const byYear = uniq(inScope.map(r => r.fiscalYear))
    .sort((a, b) => a - b)
    .map(year => {
      const ys = inScope.filter(r => r.fiscalYear === year);
      return {
        year,
        live: ys.filter(r => r.status === 'live').length,
        missing: ys.filter(isMissing).length,
      };
    });

  // pdfinfo occasionally reports a mangled field where the Producer should be
  // -- a document whose metadata is damaged enough that the key and the value
  // slid apart. That is not a producer, it is a missing one.
  const producers = live
    .map(r => r.pdfProducer)
    .filter(p => p && !p.startsWith('CreationDate'));

  return {
    documents: rows.length,
    live: live.length,
    broken: missing.length,
    notFetched: rows.filter(r => r.status === 'not-fetched').length,
    inScope: inScope.length,
    pages: live.reduce((a, r) => a + (r.pages ?? 0), 0),
    bytes: live.reduce((a, r) => a + (r.bytes ?? 0), 0),
    ...range(years),
    findings: {
      /** Earliest fiscal year the agency's own links still deliver. */
      firstOnlineYear: Math.min(...live.map(r => r.fiscalYear).filter(Boolean)),
      retiredHost: retiredRows.length
        ? {
            hosts: uniq(retiredRows.map(r => r.host)),
            documents: retiredRows.length,
            series: uniq(retiredRows.map(r => r.series)),
            ...range(retiredRows.map(r => r.fiscalYear)),
          }
        : null,
      dead: deadRows.length
        ? {
            documents: deadRows.length,
            series: uniq(deadRows.map(r => r.series)),
            /** True when every 404 falls inside the procurement series. */
            allProcurement: deadRows.every(r => PROCUREMENT.has(r.series)),
            /** Revisions to a plan already published, rather than first issues. */
            revisions: deadRows.filter(r => r.variant).length,
            years: uniq(deadRows.map(r => r.fiscalYear)).sort((a, b) => a - b),
            ...range(deadRows.map(r => r.fiscalYear)),
          }
        : null,
      byYear,
      production: {
        producers: uniq(producers).length,
        noProducer: live.length - producers.length,
        pageSizes: spread(rows, ['far1', 'far5', 'bar1'], 'pageSize'),
      },
    },
    bySeries: Object.fromEntries(
      uniq(rows.map(r => r.series)).map(k => [
        k,
        {
          total: rows.filter(r => r.series === k).length,
          live: live.filter(r => r.series === k).length,
        },
      ])
    ),
  };
}
