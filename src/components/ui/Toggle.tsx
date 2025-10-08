import React from 'react';
import { cn } from '../../lib/utils';

interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
}

export default function Toggle({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  className,
  icon: Icon,
  iconPosition = 'left',
}: ToggleProps) {
  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const sizeClasses = {
    sm: {
      container: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: checked ? 'translate-x-4' : 'translate-x-0.5',
    },
    md: {
      container: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: checked ? 'translate-x-5' : 'translate-x-0.5',
    },
    lg: {
      container: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: checked ? 'translate-x-7' : 'translate-x-0.5',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn('flex items-center space-x-3', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
          currentSize.container,
          checked
            ? 'bg-black-600 dark:bg-black-500'
            : 'bg-gray-200 dark:bg-gray-600',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              'absolute mt-0.5 pointer-events-none transition-colors duration-200 w-4 h-4',
              checked
                ? iconPosition === 'left'
                  ? 'left-0.5 text-white'
                  : 'right-0.5 text-white'
                : iconPosition === 'left'
                  ? 'right-0.5 text-gray-500 dark:text-gray-400'
                  : 'left-0.5 text-gray-500 dark:text-gray-400',
              disabled && 'opacity-50'
            )}
          />
        )}
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white dark:bg-gray-200 shadow transform ring-0 transition duration-200 ease-in-out',
            currentSize.thumb,
            currentSize.translate
          )}
        />
      </button>
    </div>
  );
}
