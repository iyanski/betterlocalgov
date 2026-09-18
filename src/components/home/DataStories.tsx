import { Link } from 'react-router';
import { stories } from '../../data/psc/stories';

/**
 * Home-page teaser for the data pages.
 *
 * Driven by the story registry, so adding a story is a one-line data change
 * rather than another hand-written section. Live stories lead; the rest are
 * named honestly as forthcoming rather than linked to nothing.
 */
export default function DataStories() {
  const live = stories.filter(s => s.status === 'live');
  const building = stories.filter(s => s.status === 'building');

  return (
    <section className="border-y border-gray-200 bg-gray-50 py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
            Data
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight tracking-tight text-gray-900">
            The PSC publishes its numbers as scans. We put them back together.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            Budget, revenue, procurement and participation — read out of the
            agency's own disclosures and into tables you can compare, sort and
            download.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {live.map(s => (
            <li key={s.slug} className="flex">
              <Link
                to={s.href}
                className="flex w-full flex-col rounded-sm border border-gray-200 bg-white p-6 transition-colors hover:border-primary-400"
              >
                <h3 className="text-xl font-bold leading-tight text-gray-900">
                  {s.title}
                </h3>
                <p className="mt-3 flex-grow leading-relaxed text-gray-600">
                  {s.standfirst}
                </p>
                {s.stat ? (
                  <p className="mt-5 font-mono tabular-nums">
                    <strong className="text-2xl font-bold text-gray-900">
                      {s.stat.value}
                    </strong>{' '}
                    <span className="text-sm text-gray-500">
                      {s.stat.label}
                    </span>
                  </p>
                ) : null}
              </Link>
            </li>
          ))}

          <li className="flex">
            <div className="flex w-full flex-col rounded-sm border border-dashed border-gray-300 p-6">
              <h3 className="text-xl font-bold leading-tight text-gray-900">
                Being built
              </h3>
              <ul className="mt-3 flex-grow space-y-1.5 text-gray-600">
                {building.map(s => (
                  <li key={s.slug}>{s.title}</li>
                ))}
              </ul>
              <Link
                to="/data"
                className="mt-5 font-medium text-primary-700 underline underline-offset-2"
              >
                See what's coming
              </Link>
            </div>
          </li>
        </ul>

        {/* The provenance caveat travels with the teaser, not just the pages. */}
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-gray-500">
          These figures were extracted from scanned government documents by
          machine and may contain errors. Each page states how its numbers were
          read and links to the original.
        </p>
      </div>
    </section>
  );
}
