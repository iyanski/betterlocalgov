import { Link } from 'react-router';
import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import StoryHero from '../../components/story/StoryHero';
import SectionHeading from '../../components/story/SectionHeading';
import { stories, liveStories } from '../../data/psc/stories';
import summary from '../../../data/manifest/summary.json';

/**
 * The hub for /data/*.
 *
 * The page carries no argument of its own: the arguments live on the story
 * pages, and this one points at them. What it does carry -- the headline
 * figures and the counts in the standing note -- is read out of the story
 * registry and the committed manifest rather than typed in, so a finished page
 * announces itself here and a document that goes missing is admitted here,
 * without anyone remembering to edit this file.
 */
const { live, broken, inScope, lastYear, findings } = summary;
/** The first year the agency's own links still deliver -- not the first it lists. */
const { firstOnlineYear } = findings;

/** Small counts read better spelled out, and every count here is small. */
const WORDS = [
  'no',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
];
const word = (n: number) => WORDS[n] ?? String(n);

const finished = stories.filter(s => s.status === 'live').length;
const forthcoming = stories.filter(s => s.status === 'building').length;

export default function DataIndex() {
  return (
    <>
      <SEO
        title="Data"
        description="Philippine Sports Commission budget, revenue, procurement and participation data — read out of the agency's own scanned disclosures and published in a form you can compare, sort and download."
        keywords="PSC data, Philippine Sports Commission budget, transparency seal, open data Philippines, sports spending"
      />

      <main className="flex-grow">
        <StoryHero
          eyebrow="Built from the PSC's own disclosures"
          title="The data"
          stats={[
            // The live stories' own headline figures. A page that goes live
            // puts its finding here; nothing has to be copied across.
            ...liveStories.flatMap(s => (s.stat ? [s.stat] : [])).slice(0, 3),
            {
              value: `${firstOnlineYear}–${lastYear}`,
              label: 'years covered',
            },
          ]}
        >
          <p>
            The Philippine Sports Commission publishes its budget, its spending
            and its procurement — as scanned PDFs, one document at a time, with
            no way to compare a year against the one before it. These pages put
            those documents back together and say what is in them.
          </p>
        </StoryHero>

        <div className="container mx-auto px-4">
          <Breadcrumbs
            className="py-6"
            items={[{ label: 'Home', href: '/' }, { label: 'Data' }]}
          />
        </div>

        {/* 01 */}
        <section className="border-b border-gray-200 bg-gray-50 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="01"
              label="The stories"
              title={`${word(finished)[0].toUpperCase()}${word(finished).slice(1)} finished, ${word(forthcoming)} being read.`}
            >
              <p>
                Each page makes one argument and shows the figures underneath
                it. Every chart carries its source and how the number was read.
                The ones still being extracted are listed here unlinked, rather
                than kept out of sight until they are ready.
              </p>
            </SectionHeading>

            <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {stories.map(s => {
                const card = (
                  <>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary-600">
                        {s.navLabel}
                      </span>
                      {s.status === 'building' ? (
                        <span className="rounded-sm bg-gray-200 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-gray-600">
                          in progress
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-gray-900">
                      {s.title}
                    </h3>
                    <p className="mt-3 flex-grow leading-relaxed text-gray-600">
                      {s.standfirst}
                    </p>
                    {s.stat ? (
                      <p className="mt-5 font-mono text-sm tabular-nums text-gray-900">
                        <strong className="text-2xl font-bold">
                          {s.stat.value}
                        </strong>{' '}
                        <span className="text-gray-500">{s.stat.label}</span>
                      </p>
                    ) : null}
                    <p className="mt-5 border-t border-gray-200 pt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-gray-400">
                      {s.sources.join(' · ')}
                    </p>
                  </>
                );

                // A page that does not exist yet is listed but not linked.
                return (
                  <li key={s.slug} className="flex">
                    {s.status === 'live' ? (
                      <Link
                        to={s.href}
                        className="flex w-full flex-col rounded-sm border border-gray-200 bg-white p-6 transition-colors hover:border-primary-400"
                      >
                        {card}
                      </Link>
                    ) : (
                      <div className="flex w-full flex-col rounded-sm border border-dashed border-gray-300 bg-white/60 p-6">
                        {card}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* 02 */}
        <section className="border-b border-gray-200 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              index="02"
              label="Standing"
              title="A reading of public documents, not an official source."
            >
              <p>
                Everything above comes from documents the PSC published itself,
                on its Transparency Seal page and through freedom of information
                requests. Nothing here was obtained that the public could not
                obtain.
              </p>
            </SectionHeading>

            <div className="mt-8 max-w-3xl space-y-6 text-lg leading-relaxed text-gray-600">
              <p>
                The counts on this page — {live} documents retrieved of{' '}
                {inScope} the seal lists, {broken} that do not arrive — are read
                out of a committed manifest and change when the archive changes.
                Machines did the reading of the scans, and machines misread
                things; every data page states which of its figures came from
                OCR, which were checked again against the page image, and which
                were calculated here. Gaps are shown as gaps and never
                interpolated.
              </p>
              <p>
                Philippine government works are in the public domain under
                Section 176 of RA 8293, and the tables derived from them are
                offered on the same terms. If a figure here is wrong, the error
                is ours rather than the agency's — tell us and it gets
                corrected.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
