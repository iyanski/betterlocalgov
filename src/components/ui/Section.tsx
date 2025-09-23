import { cn } from '../../lib/utils';
export default function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('py-12 bg-white', className)}>
      <div className={cn('container mx-auto px-4', className)}>{children}</div>
    </section>
  );
}
