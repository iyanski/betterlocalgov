import { Link } from 'react-router';
import { cn } from '../../lib/utils';

interface LinkCardProps {
  to: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export default function LinkCard({
  to,
  title,
  description,
  eyebrow,
  icon,
  className,
}: LinkCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex h-full flex-col border border-ed-rule bg-ed-paper p-6 text-ed-ink no-underline transition-colors hover:border-ed-ink',
        className
      )}
    >
      {icon && <div className="mb-4 text-ed-navy">{icon}</div>}
      {eyebrow && <span className="eyebrow text-ed-navy">{eyebrow}</span>}
      <h3
        className={cn(
          'font-display text-xl font-semibold text-ed-ink group-hover:text-ed-navy',
          eyebrow && 'mt-3'
        )}
      >
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-[620px] text-[15px] leading-relaxed text-ed-ink-2">
          {description}
        </p>
      )}
    </Link>
  );
}
