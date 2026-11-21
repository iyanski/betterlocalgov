import { cn } from '../../lib/utils';

interface SectionHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  label?: React.ReactNode;
  index?: string;
  className?: string;
}

/**
 * Broadsheet-style section opener: an optional figure and mono label sitting
 * on an ink rule, followed by the section title and lede.
 */
export default function SectionHeader({
  title,
  description,
  label,
  index,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-10 max-md:mb-8', className)}>
      {(index || label) && (
        <div className="flex items-baseline gap-4 border-b border-ed-ink pb-4">
          {index && (
            <span className="font-display text-[clamp(32px,4vw,48px)] font-bold leading-none text-ed-navy">
              {index}
            </span>
          )}
          {label && (
            <span className="eyebrow tracking-[0.2em] text-ed-ink-3">
              {label}
            </span>
          )}
        </div>
      )}
      <h2 className="mt-6 max-w-[850px] font-display text-[clamp(26px,3.5vw,40px)] font-bold leading-[1.1] tracking-[-0.02em] text-ed-ink">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-[720px] text-lg leading-relaxed text-ed-ink-2 max-md:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
