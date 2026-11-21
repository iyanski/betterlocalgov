import type { DocumentHeading } from '../../lib/headings';

/**
 * "On this page" contents for long documents, after the BetterGov.ph guide
 * pages: sticky beside the article on large screens, hidden below `lg`.
 */
export default function OnThisPage({
  headings,
}: {
  headings: DocumentHeading[];
}) {
  return (
    <aside className="print:hidden lg:sticky lg:top-[calc(var(--header-height,0px)+2rem)] lg:max-h-[calc(100vh-var(--header-height,0px)-4rem)] lg:overflow-y-auto">
      <nav
        aria-labelledby="on-this-page"
        className="hidden border-t-2 border-ed-navy pt-4 lg:block"
      >
        <span id="on-this-page" className="eyebrow text-ed-navy">
          On this page
        </span>
        <ul className="mt-4 space-y-3 text-sm">
          {headings.map((heading, i) => (
            <li key={`${heading.id}-${i}`}>
              <a
                href={`#${heading.id}`}
                className="text-ed-ink-2 no-underline hover:text-ed-navy hover:underline"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
