import { cn } from '../../lib/utils';

export default function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-page px-4 md:px-6 xl:px-8',
        className
      )}
    >
      {children}
    </div>
  );
}
