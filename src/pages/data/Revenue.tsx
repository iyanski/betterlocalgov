import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import StoryHero from '../../components/story/StoryHero';
import SectionHeading from '../../components/story/SectionHeading';
import Note from '../../components/story/Note';
import SourceNote from '../../components/story/SourceNote';
import StackedColumns from '../../components/charts/StackedColumns';
import ChartLegend from '../../components/charts/ChartLegend';
import TrendChart from '../../components/charts/TrendChart';
import GroupedBars from '../../components/charts/GroupedBars';
import BarList from '../../components/charts/BarList';
import DataTable from '../../components/charts/DataTable';
import { SERIES, peso } from '../../components/charts/chartKit';
import {
  years,
  fullYears,
  partYear,
  quarterly,
  sourceKeys,
  decade,
  decadeShare,
  yearsUnderTarget,
  steepestFall,
  readings,
  documentCount,
  collectedOf,
  gamblingOf,
  otherOf,
  targetOf,
  varianceShare,
  sourceOf,
  mostSourcesInAYear,
  type RevenueYear,
} from '../../data/psc/revenue';

/* Two series only, and the pair was chosen for separation rather than
   prettiness: on this page one of them is 98% of every column and the other has
   to stay visible at two pixels tall. */
const GAMBLING = SERIES.primary;
const EVERYTHING_ELSE = SERIES.accent;
const TARGET = SERIES.muted;

const money = (n: number | null) => peso(n, { compact: true });
const exact = (n: number | null) => peso(n);
const share = (n: number | null) => (n === null ? '—' : `${n.toFixed(1)}%`);

const YEAR_ROWS = years.map(y => ({
  fiscalYear: y.fiscalYear,
  through: y.through,
  target: targetOf(y),
  collected: collectedOf(y),
  gambling: gamblingOf(y),
  variance:
    collectedOf(y) === null || targetOf(y) === null
      ? null
      : (collectedOf(y) as number) - (targetOf(y) as number),
  variancePct: varianceShare(y),
  year: y,
}));

type YearRow = (typeof YEAR_ROWS)[number];

/** Nine-year totals per revenue source, gambling excluded. */
const OTHER_SOURCES = sourceKeys
  .filter(s => s.key !== 'pagcor-pcso')
  .map(s => ({ label: s.label, value: s.total }));

const RENT_BEST = fullYears
  .map(y => ({ y, rent: sourceOf(y, 'rent') }))
  .filter(r => r.rent?.total && r.rent.target?.value)
  .sort(
    (a, b) =>
      (b.rent!.total!.value ?? 0) / (b.rent!.target!.value || 1) -
      (a.rent!.total!.value ?? 0) / (a.rent!.target!.value || 1)
  )[0];

const latestFull = fullYears[fullYears.length - 1];
const peak = [...fullYears].sort(
  (a, b) => (collectedOf(b) ?? 0) - (collectedOf(a) ?? 0)
)[0];
const trough = [...fullYears].sort(
  (a, b) => (collectedOf(a) ?? 0) - (collectedOf(b) ?? 0)
)[0];

const overTarget = fullYears.length - yearsUnderTarget.length;
const targetJump =
  partYear && targetOf(partYear) && targetOf(latestFull)
    ? ((targetOf(partYear) as number) / (targetOf(latestFull) as number) - 1) *
      100
    : null;

/** Years whose missing quarter was recovered from the form's own total. */
const derivedYears = years
  .filter(y => Object.values(y.quarters).some(q => q?.basis === 'derived'))
  .map(y => `FY${y.fiscalYear}`)
  .join(' and ');

/** The quarters, oldest first, with the empty tail of the current year cut. */
const QUARTER_POINTS = quarterly.filter(q => q.value !== null);
const lowestQuarter = [...QUARTER_POINTS].sort(
  (a, b) => (a.value as number) - (b.value as number)
)[0];

export default function Revenue() {
  return (
    <>
      <SEO
        title="Where the money comes from"
        description={`Philippine Sports Commission revenue by source, FY${decade.from}–FY${decade.to}: ${decadeShare.toFixed(0)}% of it is the agency's statutory share of PAGCOR and PCSO receipts, read from the PSC's own quarterly FAR No. 5 reports.`}
        keywords="PSC revenue, RA 6847, PAGCOR, PCSO, FAR No. 5, sports funding Philippines, internally generated funds"
      />

      <main className="flex-grow">
        <StoryHero
          eyebrow="Read from the PSC's own FAR No. 5 returns"
          title="Where the money comes from"
          stats={[
            {
              value: `${decadeShare.toFixed(0)}%`,
              label: 'of income is gambling',
            },
            {
              value: money(decade.collected) ?? '—',
              label: `collected FY${decade.from}–FY${decade.to}`,
            },
            {
              value: `${steepestFall ? steepestFall.change.toFixed(0) : '—'}%`,
              label: steepestFall
                ? `collections, FY${steepestFall.from.fiscalYear} to FY${steepestFall.to.fiscalYear}`
                : 'worst fall',
            },
            {
              value: `${yearsUnderTarget.length} of ${fullYears.length}`,
              label: 'years it missed its target',
            },
          ]}
        >
          <p>
            The Philippine Sports Commission raises its own money, and almost
            all of it is gambling money.{' '}
            <strong className="font-semibold text-white">
              {decadeShare.toFixed(0)} pesos in every 100
            </strong>{' '}
            it has collected since FY{decade.from} came from a single line on
            the form: its statutory share of PAGCOR and PCSO receipts.
          </p>
        </StoryHero>

        <div className="container mx-auto px-4">
          <Breadcrumbs
            className="py-6"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Data', href: '/data' },
              { label: 'Where the money comes from' },
            ]}
          />
        </div>

        {/* 01 */}
        <section className="border-b border-gray-200 bg-gray-50 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="01"
              label="One line, one agency"
              title="Everything else is a rounding error."
            >
              <p>
                FAR No. 5 asks an agency to list what it collected, source by
                source. The PSC's form has never carried more than{' '}
                {mostSourcesInAYear} of them in a year, and one has never fallen
                below{' '}
                {Math.min(
                  ...fullYears.map(y => {
                    const t = collectedOf(y);
                    const g = gamblingOf(y);
                    return t && g !== null ? (g / t) * 100 : 100;
                  })
                ).toFixed(0)}
                % of the total.
              </p>
            </SectionHeading>

            <div className="mt-10 max-w-4xl">
              <ChartLegend
                items={[
                  { label: 'Share from PAGCOR and PCSO', color: GAMBLING },
                  { label: 'Every other source', color: EVERYTHING_ELSE },
                ]}
              />
              <StackedColumns
                ariaLabel={`Philippine Sports Commission revenue collections by fiscal year, FY${years[0].fiscalYear} to FY${years[years.length - 1].fiscalYear}, split between the PAGCOR and PCSO share and all other sources.`}
                groups={years.map(y => ({
                  label: `FY${String(y.fiscalYear).slice(2)}`,
                  values: { gambling: gamblingOf(y), other: otherOf(y) },
                }))}
                series={[
                  { key: 'gambling', label: 'PAGCOR/PCSO', color: GAMBLING },
                  {
                    key: 'other',
                    label: 'Other sources',
                    color: EVERYTHING_ELSE,
                  },
                ]}
                yFormat={money}
                height={300}
              />
              <p className="mt-4 text-sm text-gray-500">
                Collections per fiscal year. FY
                {partYear ? partYear.fiscalYear : ''} covers the first half only
                — the agency has published through the quarter ending 30 June.
              </p>
            </div>

            <div className="mt-10 max-w-3xl">
              <Note>
                <strong className="font-semibold text-gray-900">
                  Across nine full years the PSC raised{' '}
                  {money(decade.collected)} of its own money, and{' '}
                  {money(decade.collected - decade.gambling)} of that came from
                  something other than gambling.
                </strong>{' '}
                Rent, donations, interest, the sale of worn-out equipment and
                every peso of miscellaneous income, added together, across{' '}
                {fullYears.length} years, come to{' '}
                {(
                  ((decade.collected - decade.gambling) /
                    (gamblingOf(latestFull) as number)) *
                  100
                ).toFixed(0)}
                % of what PAGCOR and PCSO sent in FY{latestFull.fiscalYear}
                alone.
              </Note>
              <p className="text-lg leading-relaxed text-gray-600">
                This is the agency's own income, reported under fund cluster 05,
                internally generated funds. It is not the PSC's budget: the
                appropriation Congress votes it is a separate set of documents
                and a separate question. What this page describes is the money
                the commission raises rather than the money it is given — and
                where that money is raised is not really a choice the commission
                makes.
              </p>
            </div>
          </div>
        </section>

        {/* 02 */}
        <section className="border-b border-gray-200 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="02"
              label="The closure years"
              title="When the casinos shut, so did the funding."
            >
              <p>
                Philippine gaming halls closed in March 2020 and reopened in
                stages over the two years that followed. The agency's income
                followed them down: from {money(collectedOf(peak))} in FY
                {peak.fiscalYear} to {money(collectedOf(trough))} in FY
                {trough.fiscalYear}.
              </p>
            </SectionHeading>

            <div className="mt-10 max-w-4xl">
              <TrendChart
                ariaLabel={`Philippine Sports Commission quarterly revenue collections from FY${years[0].fiscalYear} to the quarter ending June 2026, showing the collapse through 2020 and 2021.`}
                mode="area"
                series={[
                  {
                    key: 'collections',
                    label: 'Collections in the quarter',
                    color: GAMBLING,
                    points: QUARTER_POINTS.map(q => ({ x: q.x, y: q.value })),
                  },
                ]}
                xTicks={years.map(y => y.fiscalYear)}
                xFormat={x => `FY${String(Math.round(x)).slice(2)}`}
                yFormat={money}
                annotations={[{ x: 2020, label: 'gaming halls close' }]}
                markMissing={false}
                height={300}
              />
              <p className="mt-4 text-sm text-gray-500">
                Collected in each quarter, not cumulative. The low point is{' '}
                {lowestQuarter.quarter} of FY{lowestQuarter.fiscalYear}:{' '}
                {exact(lowestQuarter.value)}.
              </p>
            </div>

            <div className="mt-10 max-w-3xl space-y-6 text-lg leading-relaxed text-gray-600">
              <p>
                The two closure years were funded at about{' '}
                {(
                  ((collectedOf(trough) as number) /
                    (collectedOf(peak) as number)) *
                  100
                ).toFixed(0)}
                % of FY{peak.fiscalYear}'s level. Nothing about sport changed in
                those two years — no programme was cancelled by the arithmetic
                of this form, and no athlete stopped competing because of it.
                What changed was the number of people at a gaming table.
              </p>
              <p>
                Collections recovered past the pre-closure peak by FY
                {fullYears.find(
                  y =>
                    y.fiscalYear > trough.fiscalYear &&
                    (collectedOf(y) ?? 0) > (collectedOf(peak) ?? 0)
                )?.fiscalYear ?? latestFull.fiscalYear}
                , and FY{latestFull.fiscalYear} was the largest year on record
                at {exact(collectedOf(latestFull))}.
              </p>
            </div>
          </div>
        </section>

        {/* 03 */}
        <section className="border-b border-gray-200 bg-gray-50 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="03"
              label="Target against actual"
              title="The target is not a forecast."
            >
              <p>
                Column 3 of the form carries the revenue target set for the
                agency in the Budget of Expenditures and Sources of Financing.
                The PSC has come in over that target in {overTarget} of{' '}
                {fullYears.length} full years, by as much as{' '}
                {share(Math.max(...fullYears.map(y => varianceShare(y) ?? 0)))}.
                The {yearsUnderTarget.length} years it missed are the closure
                years.
              </p>
            </SectionHeading>

            <div className="mt-10 max-w-4xl">
              <ChartLegend
                items={[
                  { label: 'BESF target', color: TARGET },
                  { label: 'Actually collected', color: GAMBLING },
                ]}
              />
              <GroupedBars
                rows={YEAR_ROWS.map(r => ({
                  label: `FY${r.fiscalYear}${r.through === 'Q4' ? '' : ' (H1)'}`,
                  values: { target: r.target, collected: r.collected },
                }))}
                series={[
                  { key: 'target', label: 'BESF target', color: TARGET },
                  { key: 'collected', label: 'Collected', color: GAMBLING },
                ]}
                format={money}
                tooltip={(row, s, v) =>
                  `${s.label} · ${row.label} — ${exact(v)}`
                }
              />
            </div>

            <div className="mt-10 max-w-3xl">
              <Note>
                <strong className="font-semibold text-gray-900">
                  A target the agency beats by a third in most years is not a
                  prediction of anything.
                </strong>{' '}
                It is a floor. That matters because the target is the figure the
                budget process treats as the agency's own contribution — and the
                gap between the floor and the takings is money the PSC collects
                without anyone having planned what it is for.
              </Note>
            </div>

            <div className="mt-10 max-w-4xl">
              <DataTable<YearRow>
                caption="PSC revenue target and collections by fiscal year"
                rowKey={r => String(r.fiscalYear)}
                rows={YEAR_ROWS}
                sortable
                sortParam="years"
                columns={[
                  {
                    key: 'fiscalYear',
                    label: 'Fiscal year',
                    align: 'left',
                    render: r =>
                      `FY${r.fiscalYear}${r.through === 'Q4' ? '' : ' (to Q2)'}`,
                  },
                  {
                    key: 'target',
                    label: 'BESF target',
                    align: 'right',
                    render: r => exact(r.target),
                  },
                  {
                    key: 'collected',
                    label: 'Collected',
                    align: 'right',
                    render: r => exact(r.collected),
                  },
                  {
                    key: 'gambling',
                    label: 'Of which PAGCOR/PCSO',
                    align: 'right',
                    muted: true,
                    render: r => exact(r.gambling),
                  },
                  {
                    key: 'variancePct',
                    label: 'Against target',
                    align: 'right',
                    render: r =>
                      r.variancePct === null
                        ? '—'
                        : `${r.variancePct > 0 ? '+' : ''}${r.variancePct.toFixed(0)}%`,
                  },
                ]}
              />
              <p className="mt-4 text-sm text-gray-500">
                FY{partYear?.fiscalYear} is half a year against a whole year's
                target, so its shortfall says nothing yet.
                {targetJump !== null ? (
                  <>
                    {' '}
                    That target is itself {targetJump.toFixed(0)}% above FY
                    {latestFull.fiscalYear}'s.
                  </>
                ) : null}
              </p>
            </div>
          </div>
        </section>

        {/* 04 */}
        <section className="border-b border-gray-200 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="04"
              label="The other two per cent"
              title="What the agency earns on its own."
            >
              <p>
                Strip out the gambling share and what remains is the money the
                PSC makes from its own assets and activities: the facilities it
                rents out, donations, interest, the odd sale of unserviceable
                property.
              </p>
            </SectionHeading>

            <div className="mt-8 max-w-3xl">
              <BarList
                rows={OTHER_SOURCES}
                color={EVERYTHING_ELSE}
                total={decade.collected - decade.gambling}
                format={money}
                valueLabel="over the series"
              />
              <p className="mt-4 text-sm text-gray-500">
                Totals across the {fullYears.length} full years, FY{decade.from}
                –FY{decade.to}, gambling excluded. FY{partYear?.fiscalYear} is
                left out: half a year would understate its sources against the
                rest.
              </p>
            </div>

            <div className="mt-10 max-w-3xl space-y-6 text-lg leading-relaxed text-gray-600">
              <p>
                Rent is the largest of them and the only one the agency sets a
                real target for.
                {RENT_BEST ? (
                  <>
                    {' '}
                    In FY{RENT_BEST.y.fiscalYear} it targeted{' '}
                    {exact(RENT_BEST.rent!.target!.value)} of rental income and
                    booked {exact(RENT_BEST.rent!.total!.value)} —{' '}
                    {(
                      (RENT_BEST.rent!.total!.value /
                        RENT_BEST.rent!.target!.value) *
                      100
                    ).toFixed(0)}
                    % of the figure it had published.
                  </>
                ) : null}
              </p>
              <p>
                The composition of this remainder is not stable either. The
                lines come and go with the form: affiliation fees and interest
                income appear in the older layout and vanish from the newer one,
                a foreign-exchange gain line appears in FY2022, and
                miscellaneous income —{' '}
                {money(sourceOf(latestFull, 'other')?.total?.value ?? null)} in
                FY{latestFull.fiscalYear} — is by construction the line that
                explains nothing.
              </p>
            </div>
          </div>
        </section>

        {/* 05 */}
        <section className="border-b border-gray-200 bg-gray-50 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="05"
              label="How this was read"
              title="Ten scans, and a way to tell when one was misread."
            >
              <p>
                None of this is published as data. It exists as {documentCount}{' '}
                scanned PDFs on the Transparency Seal page, one per year, most
                of them photocopies of a printout. They were read by machine,
                and machines misread scans.
              </p>
            </SectionHeading>

            <div className="mt-8 max-w-3xl space-y-6 text-lg leading-relaxed text-gray-600">
              <p>
                What makes the figures above checkable is that the PSC reports
                each one several times. Every annual PDF holds four statements,
                one per quarter ending, each cumulative from January — so a
                first-quarter collection is printed four times, in four
                different scans. The form then repeats every total down its own
                hierarchy, from "Internally Generated Funds" to "TOTAL", four or
                five printings deep.
              </p>
              <p>
                Each figure on this page is therefore a vote among independent
                readings — {readings.toLocaleString('en-US')} of them across the
                series — and the readings are weighed by whether the row they
                came from balances. Column 8 has to equal the four quarters
                beside it; column 12 has to equal column 8 less the target. A
                reading from a row that satisfies its own arithmetic counts
                double.
              </p>
            </div>

            <div className="mt-10 max-w-4xl">
              <DataTable<RevenueYear>
                caption="Source documents and how far the readings agreed"
                rowKey={y => y.docId}
                rows={years}
                columns={[
                  {
                    key: 'fiscalYear',
                    label: 'Fiscal year',
                    align: 'left',
                    render: y =>
                      y.document ? (
                        <a
                          href={y.document.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-700 underline underline-offset-2"
                        >
                          FY{y.fiscalYear}
                        </a>
                      ) : (
                        `FY${y.fiscalYear}`
                      ),
                  },
                  {
                    key: 'pages',
                    label: 'Pages',
                    align: 'right',
                    muted: true,
                    render: y => String(y.document?.pages ?? '—'),
                  },
                  {
                    key: 'statements',
                    label: 'Statements read',
                    align: 'right',
                    render: y => String(y.statements),
                  },
                  {
                    key: 'agreement',
                    label: 'Readings behind the total',
                    align: 'right',
                    render: y =>
                      y.total
                        ? y.total.basis === 'reported'
                          ? `${y.total.votes} of ${y.total.of} agree`
                          : 'added from the quarters'
                        : '—',
                  },
                  {
                    key: 'checks',
                    label: 'Arithmetic',
                    align: 'right',
                    muted: true,
                    render: y =>
                      y.checks.every(c => c.pass)
                        ? 'balances'
                        : `${y.checks.filter(c => !c.pass).length} check fails`,
                  },
                ]}
              />
            </div>

            <div className="mt-10 max-w-3xl">
              <SourceNote
                methods={['ocr', 'ocr-repaired', 'derived']}
                sources={years
                  .filter(y => y.document)
                  .map(y => ({
                    label: `FAR No. 5, FY${y.fiscalYear}`,
                    url: y.document!.sourceUrl,
                  }))}
              >
                <p>
                  These figures were{' '}
                  <strong className="font-semibold">
                    read off scanned pages by machine
                  </strong>
                  , not published as data by the Philippine Sports Commission.
                  Where a scan lost a cell, the form's own arithmetic supplied
                  it — a single missing quarter under a printed total is
                  recoverable, and both cells recovered that way ({derivedYears}
                  ) match the page image to the centavo.
                </p>
                <p>
                  Treat everything here as{' '}
                  <strong className="font-semibold">
                    indicative, not authoritative
                  </strong>
                  . Before citing a figure, open the year's PDF above and check
                  it: every row on this page comes from a page you can read
                  yourself.
                </p>
              </SourceNote>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
