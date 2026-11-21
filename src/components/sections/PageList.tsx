import LinkCard from '../ui/LinkCard';
import type { Subcategory } from '../../data/yamlLoader';

interface PageListProps {
  pages: Subcategory[];
  layout?: 'list' | 'grid';
  /** Base path for links; pages render as static cards when omitted. */
  basePath?: string;
  /** Mono label shown above each title, e.g. the parent category. */
  eyebrow?: string;
}

export default function PageList({
  pages,
  layout = 'list',
  basePath,
  eyebrow,
}: PageListProps) {
  return (
    <div
      className={
        layout === 'grid'
          ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
          : 'grid grid-cols-1 gap-4'
      }
    >
      {pages.map((page, i) =>
        basePath && page.slug ? (
          <LinkCard
            key={page.slug}
            to={`${basePath}/${page.slug}`}
            eyebrow={eyebrow}
            title={page.name}
            description={page.description}
          />
        ) : (
          <div
            key={page.slug ?? i}
            className="border border-ed-rule bg-ed-paper p-6"
          >
            {eyebrow && <span className="eyebrow text-ed-navy">{eyebrow}</span>}
            <h3
              className={`font-display text-xl font-semibold text-ed-ink ${eyebrow ? 'mt-3' : ''}`}
            >
              {page.name}
            </h3>
            {page.description && (
              <p className="mt-2 max-w-[620px] text-[15px] leading-relaxed text-ed-ink-2">
                {page.description}
              </p>
            )}
          </div>
        )
      )}
    </div>
  );
}
