import { Link } from 'react-router';
import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import StoryHero from '../../components/story/StoryHero';
import SectionHeading from '../../components/story/SectionHeading';
import Note from '../../components/story/Note';
import SourceNote from '../../components/story/SourceNote';
import TrendChart from '../../components/charts/TrendChart';
import Waterfall from '../../components/charts/Waterfall';
import ColumnChart from '../../components/charts/ColumnChart';
import StackedColumns from '../../components/charts/StackedColumns';
import ChartLegend from '../../components/charts/ChartLegend';
import DataTable from '../../components/charts/DataTable';
import { MONEY, peso } from '../../components/charts/chartKit';
import {
  budgetYears,
  fullYears,
  obligationRate,
  disbursementRate,
  byYear,
  source,
  type BudgetYear,
} from '../../data/psc/budget';

const fy2019 = byYear(2019)!;
const fy2020 = byYear(2020)!;
const fy2025 = byYear(2025)!;

/** Years the agency committed less than four-fifths of what it was given. */
const since2020 = fullYears.filter(y => y.fiscalYear >= 2020);
const bestSince2020 = Math.max(...since2020.map(obligationRate));
const worstBefore2020 = Math.min(
  ...fullYears.filter(y => y.fiscalYear < 2020).map(obligationRate)
);

/** Everything appropriated but never committed, across the full years. */
const neverCommitted = fullYears.reduce(
  (a, y) => a + y.unreleasedAppropriations + y.unobligatedAllotments,
  0
);

const pesoAxis = (n: number) => peso(n, { compact: true });

/**
 * FY2019 is thirty times its neighbours, so on a shared axis every other year
 * flattens to the baseline. Dropping it is not hiding it -- the full series is
 * shown first, immediately above -- it is letting the other nine years be read.
 */
const exSeaGames = budgetYears.map(y =>
  y.fiscalYear === 2019
    ? {
        ...y,
        adjustedAppropriations: null,
        obligations: null,
        disbursements: null,
      }
    : y
) as unknown as (typeof budgetYears)[number][];

export default function Budget() {
  return (
    <>
      <SEO
        title="Ten years of money"
        description="Philippine Sports Commission appropriations, allotments, obligations and disbursements, FY2017–FY2026, read from the agency's own quarterly FAR No. 1 reports."
        keywords="PSC budget, appropriations, obligations, disbursements, FAR No. 1, SAAOBDB, government spending Philippines"
      />

      <main className="flex-grow">
        <StoryHero
          eyebrow="From the PSC's own quarterly FAR No. 1 filings"
          title="Ten years of money"
          stats={[
            {
              value: peso(neverCommitted, { compact: true, decimals: 1 }),
              label: 'appropriated, never committed',
            },
            {
              value: `${bestSince2020.toFixed(0)}%`,
              label: 'best year since 2020',
            },
            {
              value: `${worstBefore2020.toFixed(0)}%`,
              label: 'worst year before 2020',
            },
            { value: '2017–2026', label: 'years on record' },
          ]}
        >
          <p>
            The budget is not the story. The gap between what is appropriated,
            what is released, what is committed and what is actually paid — that
            is the story.
          </p>
        </StoryHero>

        <div className="container mx-auto px-4">
          <Breadcrumbs
            className="py-6"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Data', href: '/data' },
              { label: 'Budget & spending' },
            ]}
          />
        </div>

        {/* 01 */}
        <section className="border-b border-gray-200 bg-gray-50 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="01"
              label="Where these numbers come from"
              title="Four numbers, and the distance between them."
            >
              <p>
                Every peso the PSC spends passes through four stages, and the
                agency reports all four on one form. Congress{' '}
                <strong className="font-semibold text-gray-900">
                  appropriates
                </strong>
                . The budget department{' '}
                <strong className="font-semibold text-gray-900">
                  releases
                </strong>{' '}
                an allotment — permission to spend. The agency{' '}
                <strong className="font-semibold text-gray-900">
                  obligates
                </strong>{' '}
                it by signing contracts. Money finally leaves the account when
                it is{' '}
                <strong className="font-semibold text-gray-900">
                  disbursed
                </strong>
                .
              </p>
            </SectionHeading>

            <div className="mt-10 max-w-3xl">
              <SourceNote
                methods={['ocr', 'ai-verified']}
                sources={[{ label: 'PSC Transparency Seal', url: source.url }]}
              >
                <p>
                  These figures were read by machine from scanned PDFs, then
                  read again from the page images and reconciled. Every year
                  shown satisfies all three of the form's own arithmetic
                  identities exactly, to the centavo — unreleased appropriations
                  equal appropriations minus allotments, unobligated allotments
                  equal allotments minus obligations, and unpaid obligations
                  equal obligations minus disbursements.
                </p>
                <p>
                  A figure that did not balance is not on this page. Check
                  anything here against the original filing before citing it.
                </p>
              </SourceNote>

              <Note>
                <strong className="font-semibold text-gray-900">
                  The record starts in 2017, and that is not our choice.
                </strong>{' '}
                The PSC's transparency index lists FAR No. 1 filings for
                FY2013–FY2016, but every one of those links points at a web host
                the agency retired. None of them resolve.
              </Note>
            </div>
          </div>
        </section>

        {/* 02 */}
        <section className="border-b border-gray-200 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="02"
              label="The line since 2017"
              title="One year dwarfs the rest, and it is not a sports budget."
            >
              <p>
                FY2019 is {peso(fy2019.appropriations, { compact: true })} —
                roughly thirty times the year before it. The form says why, in
                the particulars column: five billion pesos for hosting the 2019
                Southeast Asian Games.
              </p>
            </SectionHeading>

            <figure className="mt-10">
              <ChartLegend
                items={[
                  { label: 'Appropriated', color: MONEY.appropriated },
                  { label: 'Obligated', color: MONEY.obligated },
                  { label: 'Disbursed', color: MONEY.disbursed },
                ]}
              />
              <TrendChart
                ariaLabel="PSC adjusted appropriations, obligations and disbursements, FY2017 to FY2026"
                yFormat={pesoAxis}
                height={300}
                series={[
                  {
                    key: 'appropriated',
                    label: 'Appropriated',
                    color: MONEY.appropriated,
                    points: budgetYears.map(y => ({
                      x: y.fiscalYear,
                      y: y.adjustedAppropriations,
                    })),
                  },
                  {
                    key: 'obligated',
                    label: 'Obligated',
                    color: MONEY.obligated,
                    points: budgetYears.map(y => ({
                      x: y.fiscalYear,
                      y: y.obligations,
                    })),
                  },
                  {
                    key: 'disbursed',
                    label: 'Disbursed',
                    color: MONEY.disbursed,
                    points: budgetYears.map(y => ({
                      x: y.fiscalYear,
                      y: y.disbursements,
                    })),
                  },
                ]}
                annotations={[{ x: 2019, label: 'SEA Games' }]}
              />
              <figcaption className="mt-3 max-w-3xl text-sm text-gray-500">
                FY2026 covers only the first half of the year. Nothing before
                FY2017 is shown because nothing before FY2017 resolves.
              </figcaption>
            </figure>

            <div className="mt-12 max-w-3xl">
              <p className="text-lg leading-relaxed text-gray-600">
                On that scale every other year is a flat line along the bottom,
                which is exactly the problem with one enormous year. Here is the
                same chart with FY2019 removed — a tenth of the vertical range,
                and a shape worth looking at.
              </p>
            </div>

            <figure className="mt-8">
              <TrendChart
                ariaLabel="PSC adjusted appropriations, obligations and disbursements excluding FY2019, FY2017 to FY2026"
                yFormat={pesoAxis}
                height={300}
                markMissing={false}
                series={[
                  {
                    key: 'appropriated',
                    label: 'Appropriated',
                    color: MONEY.appropriated,
                    points: exSeaGames.map(y => ({
                      x: y.fiscalYear,
                      y: y.adjustedAppropriations,
                    })),
                  },
                  {
                    key: 'obligated',
                    label: 'Obligated',
                    color: MONEY.obligated,
                    points: exSeaGames.map(y => ({
                      x: y.fiscalYear,
                      y: y.obligations,
                    })),
                  },
                  {
                    key: 'disbursed',
                    label: 'Disbursed',
                    color: MONEY.disbursed,
                    points: exSeaGames.map(y => ({
                      x: y.fiscalYear,
                      y: y.disbursements,
                    })),
                  },
                ]}
              />
              <figcaption className="mt-3 max-w-3xl text-sm text-gray-500">
                FY2019 omitted. The line breaks rather than bridging the gap.
              </figcaption>
            </figure>

            <div className="mt-10 max-w-3xl">
              <p className="text-lg leading-relaxed text-gray-600">
                The budget roughly doubled between FY2018 and FY2021, doubled
                again by FY2023, then fell by half in FY2024 before climbing
                back. The grey line moves a great deal. The gap beneath it —
                between what was appropriated and what was actually paid out —
                moves more.
              </p>
            </div>
          </div>
        </section>

        {/* 03 */}
        <section className="border-b border-gray-200 bg-gray-50 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="03"
              label="The funnel"
              title="Where a single year's money stops."
            >
              <p>
                FY{fy2025.fiscalYear}, the most recent complete year. Each bar
                is carved out of the one before it. What is left at each stage
                has a name on the form, and every one of those names means money
                that did not do anything.
              </p>
            </SectionHeading>

            <figure className="mt-10">
              <Waterfall
                ariaLabel={`How the PSC's FY${fy2025.fiscalYear} appropriation was reduced at each stage`}
                steps={[
                  {
                    label: 'Appropriated',
                    value: fy2025.adjustedAppropriations,
                    kind: 'start',
                  },
                  {
                    label: 'Never released',
                    value: -fy2025.unreleasedAppropriations,
                    kind: 'delta',
                    note: 'appropriated, but no allotment issued',
                  },
                  {
                    label: 'Never committed',
                    value: -fy2025.unobligatedAllotments,
                    kind: 'delta',
                    note: 'released, but no contract signed',
                  },
                  {
                    label: 'Committed but unpaid',
                    value: -fy2025.unpaidObligations,
                    kind: 'delta',
                    note: 'obligated, but not yet disbursed',
                  },
                  {
                    label: 'Actually disbursed',
                    value: fy2025.disbursements,
                    kind: 'total',
                  },
                ]}
              />
            </figure>

            <div className="mt-10 max-w-3xl">
              <p className="text-lg leading-relaxed text-gray-600">
                Of {peso(fy2025.adjustedAppropriations, { compact: true })}{' '}
                appropriated,{' '}
                <strong className="font-semibold text-gray-900">
                  {peso(fy2025.disbursements, { compact: true })}
                </strong>{' '}
                left the account — {disbursementRate(fy2025).toFixed(1)}%.{' '}
                {peso(fy2025.unreleasedAppropriations, { compact: true })} was
                never released at all, and a further{' '}
                {peso(fy2025.unobligatedAllotments, { compact: true })} was
                released but never committed to anything.
              </p>
            </div>
          </div>
        </section>

        {/* 04 */}
        <section className="border-b border-gray-200 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="04"
              label="What share gets spent"
              title="Something changed in 2020, and it did not change back."
            >
              <p>
                Before 2020 the PSC committed at least{' '}
                {worstBefore2020.toFixed(0)}% of its budget every year. Since
                2020 it has never once managed {bestSince2020.toFixed(0)}%.
              </p>
            </SectionHeading>

            <figure className="mt-10">
              <ColumnChart
                data={fullYears.map(y => ({
                  key: y.fiscalYear,
                  label: String(y.fiscalYear).slice(2),
                  value: obligationRate(y),
                }))}
                color={MONEY.obligated}
                ariaLabel="Share of adjusted appropriation obligated, by fiscal year"
                axisLabel="FISCAL YEAR"
                yFormat={n => `${n.toFixed(0)}%`}
                tooltip={d =>
                  `FY${d.key} — ${d.value.toFixed(1)}% of the appropriation obligated`
                }
                domainMax={100}
                refLine={{ value: 100, label: 'the whole budget' }}
                labelEvery={1}
                height={240}
              />
              <figcaption className="mt-3 max-w-3xl text-sm text-gray-500">
                Obligations as a share of adjusted appropriations. Full fiscal
                years only.
              </figcaption>
            </figure>

            <div className="mt-10 max-w-3xl">
              <Note>
                <strong className="font-semibold text-gray-900">
                  This is not a story about an agency that cannot spend money.
                </strong>{' '}
                In FY2019, handed{' '}
                {peso(fy2019.appropriations, { compact: true })} and a deadline,
                the PSC obligated {obligationRate(fy2019).toFixed(1)}% of it.
                The capacity exists when the occasion demands it.
              </Note>
            </div>
          </div>
        </section>

        {/* 05 */}
        <section className="border-b border-gray-200 bg-gray-50 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="05"
              label="The money that never arrived"
              title="Two different failures, and the form distinguishes them."
            >
              <p>
                Money can stall in two places. The budget department can decline
                to release it — it stays an appropriation on paper and is never
                allotted. Or the agency can receive it and not commit it. The
                first is not the PSC's doing. The second is.
              </p>
            </SectionHeading>

            <figure className="mt-10">
              <ChartLegend
                items={[
                  { label: 'Never released', color: MONEY.unreleased },
                  {
                    label: 'Released, not committed',
                    color: MONEY.unobligated,
                  },
                ]}
              />
              <StackedColumns
                ariaLabel="Unreleased appropriations and unobligated allotments by fiscal year"
                groups={fullYears.map(y => ({
                  label: String(y.fiscalYear).slice(2),
                  values: {
                    unreleased: y.unreleasedAppropriations,
                    unobligated: y.unobligatedAllotments,
                  },
                }))}
                series={[
                  {
                    key: 'unreleased',
                    label: 'Never released',
                    color: MONEY.unreleased,
                  },
                  {
                    key: 'unobligated',
                    label: 'Released, not committed',
                    color: MONEY.unobligated,
                  },
                ]}
                yFormat={pesoAxis}
                height={270}
              />
            </figure>

            <div className="mt-10 max-w-3xl">
              <p className="text-lg leading-relaxed text-gray-600">
                Across the nine complete years on record,{' '}
                <strong className="font-semibold text-gray-900">
                  {peso(neverCommitted, { compact: true, decimals: 1 })}
                </strong>{' '}
                was appropriated to the Philippine Sports Commission and never
                committed to anything — either never released to it, or released
                and left unspent.
              </p>
            </div>
          </div>
        </section>

        {/* 06 */}
        <section className="border-b border-gray-200 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="06"
              label="FY2020"
              title="The year the budget was taken back."
            >
              <p>
                Every other year on this page has a clean adjustments column.
                FY2020 does not.
              </p>
            </SectionHeading>

            <div className="mt-10 max-w-3xl space-y-5 text-lg leading-relaxed text-gray-600">
              <p>
                The PSC began FY2020 with{' '}
                {peso(fy2020.appropriations, { compact: true })}. Partway
                through the year,{' '}
                <strong className="font-semibold text-gray-900">
                  {peso(Math.abs(fy2020.adjustments), { compact: true })} was
                  withdrawn
                </strong>{' '}
                — a negative adjustment of{' '}
                {(
                  (Math.abs(fy2020.adjustments) / fy2020.appropriations) *
                  100
                ).toFixed(0)}
                % of the original appropriation, almost certainly swept into the
                pandemic response.
              </p>
              <p>
                Of the {peso(fy2020.adjustedAppropriations, { compact: true })}{' '}
                that survived, a further{' '}
                {peso(fy2020.unreleasedAppropriations, { compact: true })} was
                never released. The agency ended the year having spent{' '}
                {peso(fy2020.disbursements, { compact: true })} —{' '}
                <strong className="font-semibold text-gray-900">
                  {(
                    (fy2020.disbursements / fy2020.appropriations) *
                    100
                  ).toFixed(1)}
                  % of the budget it started with
                </strong>
                .
              </p>
            </div>
          </div>
        </section>

        {/* 07 */}
        <section className="border-b border-gray-200 bg-gray-50 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="07"
              label="The figures"
              title="Every number on this page."
            >
              <p>
                The agency-specific budget only. Automatic appropriations,
                continuing appropriations and special purpose funds are reported
                by the agency as separate statements and are not included here.
              </p>
            </SectionHeading>

            <div className="mt-10">
              <DataTable<BudgetYear>
                caption="PSC agency-specific budget by fiscal year, FY2017 to FY2026"
                rows={budgetYears}
                rowKey={r => String(r.fiscalYear)}
                sortable
                sortParam="fy"
                columns={[
                  {
                    key: 'fiscalYear',
                    label: 'FY',
                    align: 'left',
                    render: r =>
                      r.through === 'Q2'
                        ? `${r.fiscalYear} (to Q2)`
                        : String(r.fiscalYear),
                  },
                  {
                    key: 'adjustedAppropriations',
                    label: 'Appropriated',
                    align: 'right',
                    render: r =>
                      peso(r.adjustedAppropriations, { decimals: 0 }),
                  },
                  {
                    key: 'adjustedAllotments',
                    label: 'Released',
                    align: 'right',
                    render: r => peso(r.adjustedAllotments, { decimals: 0 }),
                  },
                  {
                    key: 'obligations',
                    label: 'Obligated',
                    align: 'right',
                    render: r => peso(r.obligations, { decimals: 0 }),
                  },
                  {
                    key: 'disbursements',
                    label: 'Disbursed',
                    align: 'right',
                    render: r => peso(r.disbursements, { decimals: 0 }),
                  },
                  {
                    key: 'rate',
                    label: 'Obligated %',
                    align: 'right',
                    muted: true,
                    sortValue: r => obligationRate(r),
                    render: r => `${obligationRate(r).toFixed(1)}%`,
                  },
                ]}
              />
            </div>

            <div className="mt-10 max-w-3xl rounded-sm border border-gray-200 bg-white p-6">
              <h3 className="font-semibold text-gray-900">Source</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {source.publisher}, {source.form}, 4th-quarter filings FY
                {source.firstYear}–FY2025 and the 2nd-quarter filing for FY2026,
                published on the agency's{' '}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-600 underline underline-offset-2 hover:text-primary-700"
                >
                  Transparency Seal
                </a>{' '}
                page. FY2017 and FY2018 use an older layout with no agency-total
                row; those two years are General Administration and Support plus
                Operations, the two components that make it up.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Philippine government works are in the public domain under
                Section 176 of RA 8293. If a figure here is wrong, it is our
                error and not the agency's.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <Link
                  to="/data"
                  className="rounded-sm bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
                >
                  All data stories
                </Link>
                <Link
                  to="/data/participation"
                  className="rounded-sm border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:border-gray-400"
                >
                  Who actually plays
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
