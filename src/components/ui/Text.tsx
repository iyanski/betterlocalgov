import { cn } from '../../lib/utils';

const sizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const transforms = {
  none: '',
  uppercase: 'uppercase',
  lowercase: 'lowercase',
};

export function Text({
  size = 'md',
  transform = 'none',
  className = '',
  children,
}: {
  size?: keyof typeof sizes;
  transform?: keyof typeof transforms;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        'mb-2 max-w-[720px] font-sans leading-relaxed text-ed-ink-2',
        sizes[size],
        transforms[transform],
        className
      )}
    >
      {children}
    </p>
  );
}
