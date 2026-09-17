import { Link } from 'react-router';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import {
  batangPinoy,
  nationalGames,
  paraGames,
  totals,
  source,
  type GameData,
} from '../data/grassrootsParticipation';

/* Series colours come from the site's own theme tokens and were checked for
   colour-vision separation (primary-600 vs accent-600, deltaE 29 protan). */
const MALE = 'var(--color-primary-600)';
const FEMALE = 'var(--color-accent-600)';
const PARA = 'var(--color-secondary-600)';

const fmt = (n: number) => n.toLocaleString('en-US');
const pct = (n: number, of: number) => ((n / of) * 100).toFixed(1);

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
      {children}
    </p>
  );
}

function SectionHeading({
  index,
  label,
  title,
  children,
}: {
  index: string;
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-xs tracking-[0.18em] text-gray-400">
          {index}
        </span>
        <Eyebrow>{label}</Eyebrow>
      </div>
      <h2 className="mt-3 text-3xl md:text-5xl font-bold leading-[1.08] tracking-tight text-gray-900">
        {title}
      </h2>
      {children ? (
        <div className="mt-5 text-lg md:text-xl leading-relaxed text-gray-600">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function BarList({
  rows,
  color,
  total,
}: {
  rows: [string, number][];
  color: string;
  total: number;
}) {
  const max = Math.max(...rows.map(r => r[1]));
  return (
    <ul className="mt-5 space-y-1.5">
      {rows.map(([name, value]) => (
        <li
          key={name}
          className="grid grid-cols-[minmax(84px,132px)_1fr_auto] items-center gap-3"
          title={`${name} — ${fmt(value)} athletes (${pct(value, total)}%)`}
        >
          <span className="text-right text-[13px] leading-tight text-gray-600">
            {name}
          </span>
          <span className="h-4 overflow-hidden rounded-sm bg-gray-100">
            <span
              className="block h-full rounded-r-sm"
              style={{ width: `${(value / max) * 100}%`, background: color }}
            />
          </span>
          <span className="min-w-[46px] text-right font-mono text-xs tabular-nums text-gray-500">
            {fmt(value)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function AgeChart({
  ages,
  color,
  label,
}: {
  ages: GameData['ages'];
  color: string;
  label: string;
}) {
  const entries = Object.entries(ages)
    .map(([age, [m, f]]) => [Number(age), m + f] as [number, number])
    .sort((a, b) => a[0] - b[0]);
  const W = 460;
  const H = 210;
  const L = 38;
  const R = 8;
  const T = 14;
  const B = 32;
  const iw = W - L - R;
  const ih = H - T - B;
  const max = Math.max(...entries.map(e => e[1]));
  const bw = iw / entries.length;
  const ticks = [0, Math.round(max / 2), max];
  const labelStep = entries.length > 20 ? Math.ceil(entries.length / 7) : 2;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={label}
      className="w-full h-auto"
    >
      {ticks.map(t => {
        const y = T + ih - (t / max) * ih;
        return (
          <g key={t}>
            <line
              x1={L}
              x2={W - R}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <text
              x={L - 7}
              y={y + 3.5}
              textAnchor="end"
              fill="#9ca3af"
              fontSize={9.5}
              fontFamily="ui-monospace, monospace"
            >
              {fmt(t)}
            </text>
          </g>
        );
      })}
      {entries.map(([age, v], i) => {
        const h = (v / max) * ih;
        return (
          <rect
            key={age}
            x={L + i * bw + 0.8}
            y={T + ih - h}
            width={Math.max(1.4, bw - 1.6)}
            height={Math.max(h, 0.8)}
            rx={1.5}
            fill={color}
          >
            <title>{`Age ${age} — ${fmt(v)} athletes`}</title>
          </rect>
        );
      })}
      {entries.map(([age], i) =>
        i % labelStep === 0 || i === entries.length - 1 ? (
          <text
            key={`l${age}`}
            x={L + i * bw + bw / 2}
            y={H - B + 15}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize={9.5}
            fontFamily="ui-monospace, monospace"
          >
            {age}
          </text>
        ) : null
      )}
      <text
        x={L}
        y={H - 3}
        fill="#9ca3af"
        fontSize={9.5}
        fontFamily="ui-monospace, monospace"
        letterSpacing="0.08em"
      >
        AGE
      </text>
    </svg>
  );
}

function GenderBar({
  name,
  male,
  female,
}: {
  name: string;
  male: number;
  female: number;
}) {
  const t = male + female;
  return (
    <div className="border-b border-gray-200 py-4">
      <div className="mb-2 font-semibold text-gray-900">{name}</div>
      <div className="flex h-8 gap-0.5 overflow-hidden rounded-sm">
        <span
          style={{ width: `${(male / t) * 100}%`, background: MALE }}
          title={`Male — ${fmt(male)} (${pct(male, t)}%)`}
        />
        <span
          style={{ width: `${(female / t) * 100}%`, background: FEMALE }}
          title={`Female — ${fmt(female)} (${pct(female, t)}%)`}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-xs tabular-nums text-gray-500">
        <span>
          {fmt(male)} male · {pct(male, t)}%
        </span>
        <span>
          {fmt(female)} female · {pct(female, t)}%
        </span>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mb-4 flex flex-wrap gap-5 font-mono text-xs uppercase tracking-wider text-gray-600">
      <span className="flex items-center gap-2">
        <i
          className="inline-block h-3 w-3 rounded-sm"
          style={{ background: MALE }}
        />
        Male
      </span>
      <span className="flex items-center gap-2">
        <i
          className="inline-block h-3 w-3 rounded-sm"
          style={{ background: FEMALE }}
        />
        Female
      </span>
    </div>
  );
}

function DelegationTable({
  rows,
  total,
}: {
  rows: GameData['topLgus'];
  total: number;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="mt-2 w-full text-sm">
        <thead>
          <tr>
            <th className="border-b border-gray-200 py-2 pr-3 text-left font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-gray-400">
              Delegation
            </th>
            <th className="border-b border-gray-200 py-2 pr-3 text-right font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-gray-400">
              Athletes
            </th>
            <th className="border-b border-gray-200 py-2 text-right font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-gray-400">
              Share
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.lgu}>
              <td className="border-b border-gray-100 py-2 pr-3 text-gray-700">
                {r.lgu}
              </td>
              <td className="border-b border-gray-100 py-2 pr-3 text-right font-mono tabular-nums text-gray-700">
                {fmt(r.total)}
              </td>
              <td className="border-b border-gray-100 py-2 text-right font-mono tabular-nums text-gray-400">
                {pct(r.total, total)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-7 border-l-2 border-secondary-600 pl-5 text-lg leading-relaxed text-gray-600">
      {children}
    </div>
  );
}

function DataDisclaimer() {
  return (
    <div className="rounded-sm border border-warning-300 bg-warning-50 p-5 md:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-warning-800">
        About these figures
      </p>
      <p className="mt-3 text-base leading-relaxed text-gray-700">
        These numbers were{' '}
        <strong className="font-semibold">
          extracted from the released files by an AI assistant
        </strong>
        , not by the Philippine Sports Commission and not by a human
        statistician. Figures in the spreadsheets were read programmatically;
        the para games breakdown was transcribed from a scanned PDF table by
        reading it on screen, which is the most error-prone step here.
      </p>
      <p className="mt-3 text-base leading-relaxed text-gray-700">
        Treat everything on this page as{' '}
        <strong className="font-semibold">indicative, not authoritative</strong>
        . Transcription and aggregation errors are possible. Before citing any
        figure — in research, journalism or policy — check it against the
        original files on{' '}
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
    </div>
  );
}

const CLUSTERS: [string, string][] = [
  ['NORTH LUZON', 'North Luzon'],
  ['NCR', 'NCR'],
  ['SOUTH LUZON', 'South Luzon'],
  ['VISAYAS', 'Visayas'],
  ['MINDANAO', 'Mindanao'],
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
        {/* Hero */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="container mx-auto px-4 py-14 md:py-24">
            <Eyebrow>
              <span className="text-primary-100">
                Obtained under Executive Order No. 2 (s. 2016)
              </span>
            </Eyebrow>
            <h1 className="mt-4 max-w-4xl text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight">
              Who actually plays
            </h1>
            <p className="mt-7 max-w-2xl text-xl md:text-2xl leading-relaxed text-primary-50">
              The PSC runs national competitions for children, for adults, and
              for athletes with disabilities. It publishes almost nothing about
              who turns up. A freedom of information request prised loose the
              registration files — and they describe{' '}
              <strong className="font-semibold text-white">
                {fmt(totals.allAthletes)} athletes
              </strong>
              .
            </p>
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-white/25 pt-7 md:grid-cols-4">
              {[
                [fmt(totals.allAthletes), 'athletes on record'],
                ['3', 'national games'],
                ['26', 'sports contested'],
                [String(batangPinoy.lguCount), 'LGUs & delegations'],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="text-4xl md:text-5xl font-bold tabular-nums leading-none">
                    {n}
                  </dt>
                  <dd className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-primary-100">
                    {l}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <Breadcrumbs
            className="py-6"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Participation data', href: '/data/participation' },
            ]}
          />
          <div className="max-w-3xl pb-4">
            <DataDisclaimer />
          </div>
        </div>

        {/* 01 */}
        <section className="border-b border-gray-200 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="01"
              label="Where these numbers come from"
              title="Nobody published this. Someone asked for it."
            >
              <p className="mb-4">
                On {source.filed} an architecture student requested
                participation data from the PSC for a thesis. Four weeks later
                the agency released six files: two spreadsheets of registration
                counts, a roster and a participants' breakdown for the para
                games, and two sets of facility design guidelines.
              </p>
              <p>
                None of it appears on psc.gov.ph. The agency's website carries
                no participation figures, no entry counts and no results archive
                for any of these three competitions. Everything below is drawn
                from that release.
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
          </div>
        </section>

        {/* 02 */}
        <section className="border-b border-gray-200 bg-gray-50 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="02"
              label="Three games, three populations"
              title="One is fifteen times the size of another."
            >
              <p>
                Batang Pinoy is the children's games. The Philippine National
                Games is the open-age competition. The Philippine National Para
                Games is for athletes with disabilities.
              </p>
            </SectionHeading>

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

        {/* 03 */}
        <section className="border-b border-gray-200 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="03"
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
              <Legend />
              <GenderBar
                name="Batang Pinoy 2023"
                male={totals.batangPinoyMale}
                female={totals.batangPinoyFemale}
              />
              <GenderBar
                name="Philippine National Games"
                male={totals.nationalGamesMale}
                female={totals.nationalGamesFemale}
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
                <AgeChart
                  ages={batangPinoy.ages}
                  color={MALE}
                  label="Batang Pinoy athletes by age, 4 to 17"
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
                <AgeChart
                  ages={nationalGames.ages}
                  color={FEMALE}
                  label="Philippine National Games athletes by age, 16 to 70"
                />
                <p className="mt-3 text-sm text-gray-500">
                  Peaks at 18 and collapses after 22. The oldest registered
                  athlete is 70.
                </p>
              </figure>
            </div>
          </div>
        </section>

        {/* 04 */}
        <section className="border-b border-gray-200 bg-gray-50 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="04"
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
                    .map(s => [s.sport, s.total])}
                  color={MALE}
                  total={totals.batangPinoy}
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
                    .map(s => [s.sport, s.total])}
                  color={FEMALE}
                  total={totals.nationalGames}
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

        {/* 05 */}
        <section className="border-b border-gray-200 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="05"
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
              <div className="mb-4 flex flex-wrap gap-5 font-mono text-xs uppercase tracking-wider text-gray-600">
                <span className="flex items-center gap-2">
                  <i
                    className="inline-block h-3 w-3 rounded-sm"
                    style={{ background: MALE }}
                  />
                  Batang Pinoy
                </span>
                <span className="flex items-center gap-2">
                  <i
                    className="inline-block h-3 w-3 rounded-sm"
                    style={{ background: FEMALE }}
                  />
                  National Games
                </span>
              </div>
              {CLUSTERS.map(([key, label]) => {
                const bp = batangPinoy.clusters[key].total;
                const ng = nationalGames.clusters[key].total;
                const bpp = (bp / totals.batangPinoy) * 100;
                const ngp = (ng / totals.nationalGames) * 100;
                const scale = 30;
                return (
                  <div key={key} className="border-b border-gray-200 py-3.5">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-semibold text-gray-900">
                        {label}
                      </span>
                      <span className="font-mono tabular-nums text-gray-500">
                        {bpp.toFixed(1)}% · {ngp.toFixed(1)}%
                      </span>
                    </div>
                    <span
                      className="mb-1 block h-3 overflow-hidden rounded-sm bg-gray-100"
                      title={`Batang Pinoy · ${label} — ${fmt(bp)} (${bpp.toFixed(1)}%)`}
                    >
                      <span
                        className="block h-full rounded-r-sm"
                        style={{
                          width: `${(bpp / scale) * 100}%`,
                          background: MALE,
                        }}
                      />
                    </span>
                    <span
                      className="block h-3 overflow-hidden rounded-sm bg-gray-100"
                      title={`National Games · ${label} — ${fmt(ng)} (${ngp.toFixed(1)}%)`}
                    >
                      <span
                        className="block h-full rounded-r-sm"
                        style={{
                          width: `${(ngp / scale) * 100}%`,
                          background: FEMALE,
                        }}
                      />
                    </span>
                  </div>
                );
              })}
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
                <DelegationTable
                  rows={batangPinoy.topLgus.slice(0, 10)}
                  total={totals.batangPinoy}
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Largest delegations — National Games
                </h3>
                <DelegationTable
                  rows={nationalGames.topLgus.slice(0, 10)}
                  total={totals.nationalGames}
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

        {/* 06 */}
        <section className="border-b border-gray-200 bg-gray-50 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="06"
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
                />
              </div>
            </div>
            <p className="mt-6 max-w-3xl text-sm text-gray-500">
              Pasig alone sent 119 athletes — 13.8% of the entire games, and
              more than the next two delegations combined.
            </p>
          </div>
        </section>

        {/* 07 */}
        <section className="border-b border-gray-200 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="07"
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
