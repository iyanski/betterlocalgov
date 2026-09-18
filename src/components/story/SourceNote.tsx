import { METHOD_LABEL } from './extraction';
import type { ExtractionMethod, SourceRef } from './extraction';

/**
 * How a figure on this site came to exist.
 *
 * Republishing government data creates an obligation the original publisher
 * does not have: the PSC printed these numbers, but it did not produce the
 * tables on this site. Machines read them, and machines misread things. Every
 * data story carries one of these, and the goal is not zero errors -- it is
 * zero HIDDEN errors.
 */

export default function SourceNote({
  title = 'About these figures',
  methods,
  sources,
  children,
}: {
  title?: string;
  methods?: ExtractionMethod[];
  sources?: SourceRef[];
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border border-warning-300 bg-warning-50 p-5 md:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-warning-800">
        {title}
      </p>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-gray-700">
        {children}
      </div>

      {methods && methods.length ? (
        <ul className="mt-4 space-y-1.5 border-t border-warning-300/60 pt-4">
          {methods.map(m => (
            <li
              key={m}
              className="flex gap-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-warning-800"
            >
              <span aria-hidden="true">·</span>
              <span>{METHOD_LABEL[m]}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {sources && sources.length ? (
        <p className="mt-4 text-sm text-gray-600">
          Source:{' '}
          {sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 ? ', ' : ''}
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-primary-700 underline underline-offset-2"
              >
                {s.label}
              </a>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
