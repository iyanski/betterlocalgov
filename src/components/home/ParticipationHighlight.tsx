import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import Section from '../ui/Section';
import { totals } from '../../data/grassrootsParticipation';

const fmt = (n: number) => n.toLocaleString('en-US');

/**
 * Home-page entry point for the participation report. The figures come from
 * the PSC's own FOI release; none of them are published on psc.gov.ph.
 */
export default function ParticipationHighlight() {
  return (
    <Section>
      <div className="rounded-sm border border-gray-200 bg-gray-50 p-7 md:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
              Participation data
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-[1.1] tracking-tight text-gray-900">
              Who actually plays
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              {fmt(totals.allAthletes)} athletes across Batang Pinoy, the
              Philippine National Games and the Para Games — counted by sport,
              age, gender and home town. The PSC does not publish any of it;
              these figures were obtained under freedom of information.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Figures were extracted from the released files by an AI assistant
              and may contain errors. Check against the source before citing.
            </p>
            <Link
              to="/data/participation"
              className="mt-6 inline-flex items-center gap-2 rounded-sm bg-primary-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
            >
              Read the report
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <dl className="grid shrink-0 grid-cols-3 gap-x-8 gap-y-2 lg:grid-cols-1 lg:gap-y-6">
            {[
              [fmt(totals.batangPinoy), 'Batang Pinoy'],
              [fmt(totals.nationalGames), 'National Games'],
              [fmt(totals.paraGames), 'Para Games'],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="text-3xl md:text-4xl font-bold tabular-nums leading-none text-primary-700">
                  {n}
                </dt>
                <dd className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-gray-500">
                  {l}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}
