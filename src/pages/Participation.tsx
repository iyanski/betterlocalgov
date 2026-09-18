import { Link } from 'react-router';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SectionHeading from '../components/story/SectionHeading';
import Note from '../components/story/Note';
import SourceNote from '../components/story/SourceNote';
import StoryHero from '../components/story/StoryHero';
import BarList from '../components/charts/BarList';
import ColumnChart from '../components/charts/ColumnChart';
import StackedBar from '../components/charts/StackedBar';
import ChartLegend from '../components/charts/ChartLegend';
import DataTable from '../components/charts/DataTable';
import GroupedBars from '../components/charts/GroupedBars';
import { SERIES, fmt, pct } from '../components/charts/chartKit';
import {
  batangPinoy,
  nationalGames,
  paraGames,
  totals,
  source,
  type GameData,
  type Delegation,
} from '../data/grassrootsParticipation';

/* Series colours come from the site's own theme tokens and were checked for
   colour-vision separation (primary-600 vs accent-600, deltaE 29 protan). */
const MALE = SERIES.primary;
const FEMALE = SERIES.accent;
const PARA = SERIES.secondary;

const CLUSTERS: [string, string][] = [
  ['NORTH LUZON', 'North Luzon'],
  ['NCR', 'NCR'],
  ['SOUTH LUZON', 'South Luzon'],
  ['VISAYAS', 'Visayas'],
  ['MINDANAO', 'Mindanao'],
];

/** age -> total entrants, for the histograms. */
const byAge = (ages: GameData['ages']) =>
  Object.entries(ages)
    .map(([age, [m, f]]) => ({ key: age, label: age, value: m + f }))
    .sort((a, b) => Number(a.key) - Number(b.key));

/** Shared column set for the two delegation tables. */
const delegationColumns = (total: number) => [
  { key: 'lgu', label: 'Delegation', align: 'left' as const },
  {
    key: 'total',
    label: 'Athletes',
    align: 'right' as const,
    render: (r: Delegation) => fmt(r.total),
  },
  {
    key: 'share',
    label: 'Share',
    align: 'right' as const,
    muted: true,
    sortValue: (r: Delegation) => r.total,
    render: (r: Delegation) => `${pct(r.total, total)}%`,
  },
];

export default function Participation() {
  const games: [string, number, string][] = [
    ['Batang Pinoy 2023', totals.batangPinoy, MALE],
    ['Philippine National Games', totals.nationalGames, FEMALE],
    ['Philippine National Para Games 2024', totals.paraGames, PARA],
  ];

  return (
    <>
      <SEO
        title="Who actually plays"
        description="20,662 athletes across three national games — participation data the Philippine Sports Commission does not publish, obtained under freedom of information."
        keywords="Batang Pinoy, Philippine National Games, Philippine National Para Games, participation data, PSC, freedom of information"
      />

      <main className="flex-grow">
        <StoryHero
          eyebrow="Obtained under Executive Order No. 2 (s. 2016)"
          title="Who actually plays"
          stats={[
            { value: fmt(totals.allAthletes), label: 'athletes on record' },
            { value: '3', label: 'national games' },
            { value: '26', label: 'sports contested' },
            {
              value: String(batangPinoy.lguCount),
              label: 'LGUs & delegations',
            },
          ]}
        >
          <p>
            The PSC runs national competitions for children, for adults, and for
            athletes with disabilities. It publishes almost nothing about who
            turns up. A freedom of information request prised loose the
            registration files — and they describe{' '}
            <strong className="font-semibold text-white">
              {fmt(totals.allAthletes)} athletes
            </strong>
            .
          </p>
        </StoryHero>

        <div className="container mx-auto px-4">
          <Breadcrumbs
            className="py-6"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Participation data', href: '/data/participation' },
            ]}
          />
        </div>

        {/* 01 */}
        <section className="border-b border-gray-200 bg-gray-50 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="01"
              label="Three games, three populations"
              title="One is fifteen times the size of another."
            >
              <p>
                Batang Pinoy is the children's games. The Philippine National
                Games is the open-age competition. The Philippine National Para
                Games is for athletes with disabilities.
              </p>
            </SectionHeading>

            <div className="max-w-3xl">
              <Note>
                <strong className="font-semibold text-gray-900">
                  Read this as a registration census, not a medal table.
                </strong>{' '}
                The files count athletes who registered. They record no results,
                no medals and no dates, so nothing here says how anyone
                performed.
              </Note>
            </div>

            <div className="mt-10 max-w-4xl">
              {games.map(([name, value, color]) => (
                <div key={name} className="border-b border-gray-200 py-4">
                  <div className="mb-2 flex items-baseline justify-between gap-4">
                    <span className="font-semibold text-gray-900">{name}</span>
                    <span className="font-mono text-base tabular-nums text-gray-700">
                      {fmt(value)}
                    </span>
                  </div>
                  <span className="block h-6 overflow-hidden rounded-sm bg-gray-200">
                    <span
                      className="block h-full rounded-r-sm"
                      style={{
                        width: `${(value / totals.batangPinoy) * 100}%`,
                        background: color,
                      }}
                    />
                  </span>
                </div>
              ))}
              <p className="mt-4 text-sm text-gray-500">
                The para games are {pct(totals.paraGames, totals.batangPinoy)}%
                the size of Batang Pinoy. The release does not say what year the
                national games figures cover.
              </p>
            </div>
          </div>
        </section>

        {/* 02 */}
        <section className="border-b border-gray-200 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="02"
              label="Who competes"
              title="Girls leave the system as the age rises."
            >
              <p>
                In the children's games,{' '}
                {pct(totals.batangPinoyFemale, totals.batangPinoy)}% of
                registered athletes are girls. In the open-age games, women are{' '}
                {pct(totals.nationalGamesFemale, totals.nationalGames)}%.
                Whatever happens between those two competitions, it removes
                women faster than men.
              </p>
            </SectionHeading>

            <div className="mt-10 max-w-4xl">
              <ChartLegend
                items={[
                  { label: 'Male', color: MALE },
                  { label: 'Female', color: FEMALE },
                ]}
              />
              <StackedBar
                name="Batang Pinoy 2023"
                segments={[
                  {
                    label: 'Male',
                    value: totals.batangPinoyMale,
                    color: MALE,
                  },
                  {
                    label: 'Female',
                    value: totals.batangPinoyFemale,
                    color: FEMALE,
                  },
                ]}
              />
              <StackedBar
                name="Philippine National Games"
                segments={[
                  {
                    label: 'Male',
                    value: totals.nationalGamesMale,
                    color: MALE,
                  },
                  {
                    label: 'Female',
                    value: totals.nationalGamesFemale,
                    color: FEMALE,
                  },
                ]}
              />
              <p className="mt-4 text-sm text-gray-500">
                Only two sports in each competition drew more women than men:
                gymnastics and dancesport in Batang Pinoy, gymnastics and beach
                volleyball in the national games.
              </p>
            </div>

            <div className="mt-14 grid gap-10 lg:grid-cols-2">
              <figure>
                <figcaption className="mb-1 font-semibold text-gray-900">
                  Batang Pinoy — ages 4 to 17
                </figcaption>
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-gray-400">
                  Athletes by age
                </p>
                <ColumnChart
                  data={byAge(batangPinoy.ages)}
                  color={MALE}
                  tickMode="data"
                  axisLabel="AGE"
                  ariaLabel="Batang Pinoy athletes by age, 4 to 17"
                  tooltip={d => `Age ${d.key} — ${fmt(d.value)} athletes`}
                />
                <p className="mt-3 text-sm text-gray-500">
                  Peaks at 16. Half of all entrants are 14 or older.
                </p>
              </figure>
              <figure>
                <figcaption className="mb-1 font-semibold text-gray-900">
                  National Games — ages 16 to 70
                </figcaption>
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-gray-400">
                  Athletes by age
                </p>
                <ColumnChart
                  data={byAge(nationalGames.ages)}
                  color={FEMALE}
                  tickMode="data"
                  axisLabel="AGE"
                  ariaLabel="Philippine National Games athletes by age, 16 to 70"
                  tooltip={d => `Age ${d.key} — ${fmt(d.value)} athletes`}
                />
                <p className="mt-3 text-sm text-gray-500">
                  Peaks at 18 and collapses after 22. The oldest registered
                  athlete is 70.
                </p>
              </figure>
            </div>
          </div>
        </section>

        {/* 03 */}
        <section className="border-b border-gray-200 bg-gray-50 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="03"
              label="Which sports"
              title="Swimming and taekwondo carry the children's games."
            >
              <p>
                Two sports account for a quarter of every child registered. The
                adult games tilt differently — athletics and arnis lead, and
                swimming falls from first to sixth.
              </p>
            </SectionHeading>

            <div className="mt-10 grid gap-10 lg:grid-cols-2">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Batang Pinoy 2023
                </h3>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gray-400">
                  Top 12 of 26 sports
                </p>
                <BarList
                  rows={batangPinoy.sports
                    .slice(0, 12)
                    .map(s => ({ label: s.sport, value: s.total }))}
                  color={MALE}
                  total={totals.batangPinoy}
                  valueLabel="athletes"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Philippine National Games
                </h3>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gray-400">
                  Top 12 of 26 sports
                </p>
                <BarList
                  rows={nationalGames.sports
                    .slice(0, 12)
                    .map(s => ({ label: s.sport, value: s.total }))}
                  color={FEMALE}
                  total={totals.nationalGames}
                  valueLabel="athletes"
                />
              </div>
            </div>

            <div className="max-w-3xl">
              <Note>
                <strong className="font-semibold text-gray-900">
                  E-sports is on both lists with zero entrants.
                </strong>{' '}
                It is carried as a contested sport in both competitions, and in
                both files the male, female and total columns read 0.
              </Note>
            </div>
          </div>
        </section>

        {/* 04 */}
        <section className="border-b border-gray-200 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="04"
              label="Where they come from"
              title="Baguio sends more athletes than anywhere else. Twice."
            >
              <p>
                The City of Baguio tops both competitions — 523 children and 299
                adults. It is not the biggest city in the country, or the
                richest. It is the one with a PSC training centre.
              </p>
            </SectionHeading>

            <div className="mt-10 max-w-4xl">
              <ChartLegend
                items={[
                  { label: 'Batang Pinoy', color: MALE },
                  { label: 'National Games', color: FEMALE },
                ]}
              />
              <GroupedBars
                rows={CLUSTERS.map(([key, label]) => ({
                  label,
                  values: {
                    bp:
                      (batangPinoy.clusters[key].total / totals.batangPinoy) *
                      100,
                    ng:
                      (nationalGames.clusters[key].total /
                        totals.nationalGames) *
                      100,
                  },
                }))}
                series={[
                  { key: 'bp', label: 'Batang Pinoy', color: MALE },
                  { key: 'ng', label: 'National Games', color: FEMALE },
                ]}
                /* Pinned, not per-series: the whole point is that Batang Pinoy
                   spreads evenly while the adult games concentrate, and
                   self-normalised bars would hide exactly that. */
                scaleMax={30}
                format={v => `${v.toFixed(1)}%`}
                tooltip={(row, s, v) => {
                  const counts: Record<string, number> = {
                    bp: batangPinoy.clusters[
                      CLUSTERS.find(c => c[1] === row.label)![0]
                    ].total,
                    ng: nationalGames.clusters[
                      CLUSTERS.find(c => c[1] === row.label)![0]
                    ].total,
                  };
                  return `${s.label} · ${row.label} — ${fmt(counts[s.key])} (${v.toFixed(1)}%)`;
                }}
              />
              <p className="mt-4 text-sm text-gray-500">
                Batang Pinoy spreads evenly — no cluster holds more than a
                quarter. The adult games concentrate: North Luzon and NCR
                together take 51.8%.
              </p>
            </div>

            <div className="mt-12 grid gap-10 lg:grid-cols-2">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Largest delegations — Batang Pinoy
                </h3>
                <DataTable
                  columns={delegationColumns(totals.batangPinoy)}
                  rows={batangPinoy.topLgus.slice(0, 10)}
                  rowKey={r => r.lgu}
                  caption="Ten largest Batang Pinoy delegations by registered athletes"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Largest delegations — National Games
                </h3>
                <DataTable
                  columns={delegationColumns(totals.nationalGames)}
                  rows={nationalGames.topLgus.slice(0, 10)}
                  rowKey={r => r.lgu}
                  caption="Ten largest Philippine National Games delegations by registered athletes"
                />
              </div>
            </div>

            <div className="max-w-3xl">
              <p className="mt-8 text-lg leading-relaxed text-gray-600">
                Concentration differs sharply. The ten biggest delegations
                supply 23.0% of Batang Pinoy but 37.1% of the national games.
              </p>
              <Note>
                <strong className="font-semibold text-gray-900">
                  Twenty listed delegations registered nobody.
                </strong>{' '}
                {batangPinoy.zeroLgus.length} LGUs appear in the Batang Pinoy
                file with zero athletes, and {nationalGames.zeroLgus.length} in
                the national games file — listed, counted as participating
                units, represented by no one.
              </Note>
            </div>
          </div>
        </section>

        {/* 05 */}
        <section className="border-b border-gray-200 bg-gray-50 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="05"
              label="The para games"
              title="860 athletes, and athletics is nearly half of them."
            >
              <p>
                The 2024 Philippine National Para Games drew{' '}
                {fmt(paraGames.total)} registrations across nine sports. It is
                the only one of the three that names its delegations
                individually — PDAOs, clubs, provincial teams, and seventeen
                athletes entered simply as "Individual".
              </p>
            </SectionHeading>

            <div className="mt-10 grid gap-10 lg:grid-cols-2">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Sports contested
                </h3>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gray-400">
                  PNPG 2024
                </p>
                <BarList
                  rows={paraGames.sports}
                  color={PARA}
                  total={paraGames.total}
                  valueLabel="athletes"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Largest delegations
                </h3>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gray-400">
                  PNPG 2024 · top 10
                </p>
                <BarList
                  rows={paraGames.topDelegations}
                  color={PARA}
                  total={paraGames.total}
                  valueLabel="athletes"
                />
              </div>
            </div>
            <p className="mt-6 max-w-3xl text-sm text-gray-500">
              Pasig alone sent 119 athletes — 13.8% of the entire games, and
              more than the next two delegations combined.
            </p>
          </div>
        </section>

        {/* 06 */}
        <section className="border-b border-gray-200 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="06"
              label="What the files do not say"
              title="The gaps are part of the finding."
            >
              <p>
                An FOI release is not a dataset built for the public. These
                files were assembled to answer one student's questions, and they
                carry the seams.
              </p>
            </SectionHeading>

            <ul className="mt-7 max-w-3xl space-y-3 text-lg leading-relaxed text-gray-600">
              <li>
                <strong className="font-semibold text-gray-900">
                  No year on the national games data.
                </strong>{' '}
                Batang Pinoy is labelled 2023 and the para games 2024. The
                Philippine National Games sheets carry no date at all.
              </li>
              <li>
                <strong className="font-semibold text-gray-900">
                  The national games totals disagree with themselves by one
                  athlete.
                </strong>{' '}
                The sport-by-sport sheet totals 4,811 (1,605 women); the
                age-by-cluster sheet totals 4,810 (1,604 women). We use 4,811
                throughout and flag it here rather than quietly picking one.
              </li>
              <li>
                <strong className="font-semibold text-gray-900">
                  No results, medals, venues or dates.
                </strong>{' '}
                Registration counts only.
              </li>
              <li>
                <strong className="font-semibold text-gray-900">
                  The para games file has no gender breakdown,
                </strong>{' '}
                so the gender analysis above covers only the other two
                competitions, and no disability classification is recorded.
              </li>
              <li>
                <strong className="font-semibold text-gray-900">
                  Delegation naming is inconsistent.
                </strong>{' '}
                The same place appears as "Baguio", "City of Baguio" and "PDAO
                Baguio" across the three files. We have not merged them.
              </li>
            </ul>

            <div className="mt-10 max-w-3xl">
              <SourceNote>
                <p>
                  These numbers were{' '}
                  <strong className="font-semibold">
                    extracted from the released files by an AI assistant
                  </strong>
                  , not by the Philippine Sports Commission and not by a human
                  statistician. Figures in the spreadsheets were read
                  programmatically; the para games breakdown was transcribed
                  from a scanned PDF table by reading it on screen, which is the
                  most error-prone step here.
                </p>
                <p>
                  Treat everything on this page as{' '}
                  <strong className="font-semibold">
                    indicative, not authoritative
                  </strong>
                  . Transcription and aggregation errors are possible. Before
                  citing any figure — in research, journalism or policy — check
                  it against the original files on{' '}
                  <a
                    href="https://www.foi.gov.ph/agencies/psc/sports-data/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-700 underline underline-offset-2"
                  >
                    foi.gov.ph
                  </a>{' '}
                  or request them from the PSC directly.
                </p>
              </SourceNote>
            </div>

            <div className="mt-10 max-w-3xl rounded-sm border border-gray-200 bg-gray-50 p-6">
              <h3 className="font-semibold text-gray-900">Source</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Philippine Sports Commission, FOI request {source.trackingNo},
                filed {source.filed}, released {source.released} via{' '}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-600 underline underline-offset-2 hover:text-primary-700"
                >
                  foi.gov.ph
                </a>
                . Figures were transcribed from the released files by an AI
                assistant and may contain errors — verify against the source
                files before citing. Philippine government works are in the
                public domain unless otherwise stated.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <Link
                  to="/services/grassroots-sports/batang-pinoy"
                  className="rounded-sm bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
                >
                  Batang Pinoy
                </Link>
                <Link
                  to="/services/grassroots-sports/philippine-national-games"
                  className="rounded-sm border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:border-gray-400"
                >
                  Philippine National Games
                </Link>
                <Link
                  to="/services/inclusive-sports/pilipinas-paragames"
                  className="rounded-sm border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:border-gray-400"
                >
                  Para games
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
