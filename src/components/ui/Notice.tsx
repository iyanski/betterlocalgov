import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

// `urgent` is the only variant that uses Alert Red — keep it for advisories
// and emergencies. Ordinary errors (e.g. a missing page) use `info`.
const variants = {
  info: {
    box: 'border-ed-navy bg-ed-paper-2',
    icon: 'text-ed-navy',
    Icon: Info,
  },
  urgent: {
    box: 'border-ed-red bg-ed-paper',
    icon: 'text-ed-red',
    Icon: AlertTriangle,
  },
};

export default function Notice({
  title,
  description,
  variant = 'info',
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  const { box, icon, Icon } = variants[variant];
  return (
    <div
      role={variant === 'urgent' ? 'alert' : 'status'}
      className={cn('flex gap-3 border-l-4 p-5', box, className)}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', icon)} aria-hidden />
      <div>
        {title && (
          <p className="font-display text-lg font-semibold text-ed-ink">
            {title}
          </p>
        )}
        {description && (
          <p className={cn('text-ed-ink-2', title && 'mt-1')}>{description}</p>
        )}
      </div>
    </div>
  );
}
