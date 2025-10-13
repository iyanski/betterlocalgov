export function Text({
  size = 'md',
  transform = 'none',
  className = '',
  children,
}: {
  size?: 'sm' | 'md' | 'lg';
  transform?: 'none' | 'uppercase' | 'lowercase';
  className?: string;
  children: React.ReactNode;
}) {
  const transformClasses = {
    none: '',
    uppercase: 'uppercase',
    lowercase: 'lowercase',
  };
  return (
    <p
      className={`text-${size} mb-2 max-w-lg text-gray-700 dark:text-gray-300 ${transformClasses[transform]} ${className}`}
    >
      {children}
    </p>
  );
}
