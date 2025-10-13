import React from 'react';
import { cn } from '../../lib/utils';

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

const headingStyles = {
  1: 'text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-relaxed text-gray-900 dark:text-white',
  2: 'text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-relaxed text-gray-900 dark:text-white',
  3: 'text-xl md:text-2xl lg:text-3xl font-bold mb-4 leading-relaxed text-gray-900 dark:text-white',
  4: 'text-lg md:text-xl lg:text-2xl font-bold mb-4 leading-relaxed text-gray-900 dark:text-white',
  5: 'text-base md:text-lg lg:text-xl font-bold mb-4 leading-relaxed text-gray-900 dark:text-white',
  6: 'text-sm md:text-base lg:text-lg font-bold mb-4 leading-relaxed text-gray-900 dark:text-white',
};

export function Heading({ level = 1, children, className }: HeadingProps) {
  const baseClasses = headingStyles[level];
  const combinedClasses = cn(baseClasses, className);

  const HeadingTag = `h${level}`;

  return React.createElement(
    HeadingTag,
    { className: combinedClasses },
    children
  );
}
