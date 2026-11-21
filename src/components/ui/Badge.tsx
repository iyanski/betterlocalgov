import { cn } from '../../lib/utils';

// Red is reserved for urgency: advisories and emergencies only.
const variants = {
  navy: 'bg-ed-navy text-white border-ed-navy',
  red: 'bg-ed-red text-white border-ed-red',
  neutral: 'bg-ed-paper-2 text-ed-ink-2 border-ed-rule-strong',
};

export default function Badge({
  children,
  variant = 'neutral',
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.14em] whitespace-nowrap',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
