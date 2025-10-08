import React from 'react';
import { cn } from '../../lib/utils';

export default function Icon({
  icon,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return React.createElement(icon, { className: cn('h-4 w-4', className) });
}
