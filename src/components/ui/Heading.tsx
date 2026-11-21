import React from 'react';
import { cn } from '../../lib/utils';

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

// Figtree, upright, semibold or bold only. Never italic, never all caps.
// Use level 1 once per page: it is the only display-size heading.
const headingStyles = {
  1: 'text-[clamp(32px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.02em] mb-4',
  2: 'text-[clamp(26px,3.5vw,40px)] font-bold leading-[1.1] tracking-[-0.02em] mb-4',
  3: 'text-2xl md:text-[28px] font-semibold leading-tight tracking-[-0.01em] mb-3',
  4: 'text-xl font-semibold leading-snug mb-3',
  5: 'text-lg font-semibold leading-snug mb-2',
  6: 'text-base font-semibold leading-snug mb-2',
};

export function Heading({ level = 1, children, className }: HeadingProps) {
  return React.createElement(
    `h${level}`,
    {
      className: cn(
        'font-display text-ed-ink',
        headingStyles[level],
        className
      ),
    },
    children
  );
}
