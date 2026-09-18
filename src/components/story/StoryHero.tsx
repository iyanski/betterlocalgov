import Eyebrow from './Eyebrow';

export interface HeroStat {
  /** Pre-formatted. Charts round; hero tiles are written by hand. */
  value: string;
  label: string;
}

/**
 * Full-bleed hero for a data story: kicker, display headline, standfirst, and
 * a row of headline figures.
 *
 * The figures are a `<dl>` rather than divs because that is what they are --
 * terms and their definitions -- and a screen reader then reads "athletes on
 * record, 20,662" instead of two unrelated fragments.
 */
export default function StoryHero({
  eyebrow,
  title,
  children,
  stats,
}: {
  eyebrow: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  stats?: HeroStat[];
}) {
  return (
    <div className="border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div className="container mx-auto px-4 py-14 md:py-24">
        <Eyebrow>
          <span className="text-primary-100">{eyebrow}</span>
        </Eyebrow>
        <h1 className="mt-4 max-w-4xl text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight">
          {title}
        </h1>
        {children ? (
          <div className="mt-7 max-w-2xl text-xl md:text-2xl leading-relaxed text-primary-50">
            {children}
          </div>
        ) : null}
        {stats && stats.length ? (
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-white/25 pt-7 md:grid-cols-4">
            {stats.map(s => (
              <div key={s.label}>
                <dt className="text-4xl md:text-5xl font-bold tabular-nums leading-none">
                  {s.value}
                </dt>
                <dd className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-primary-100">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </div>
  );
}
