import React from 'react';
import { Link } from 'react-router-dom';

interface SkipNavigationProps {
  className?: string;
}

export default function SkipNavigation({
  className = '',
}: SkipNavigationProps) {
  return (
    <div className={`sr-only focus-within:not-sr-only ${className}`}>
      <nav aria-label="Skip navigation">
        <ul className="flex flex-col space-y-2 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <li>
            <Link
              to="#main-content"
              className="block px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:bg-primary-700 rounded-md transition-colors"
            >
              Skip to main content
            </Link>
          </li>
          <li>
            <Link
              to="#main-navigation"
              className="block px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:bg-primary-700 rounded-md transition-colors"
            >
              Skip to navigation
            </Link>
          </li>
          <li>
            <Link
              to="#search"
              className="block px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:bg-primary-700 rounded-md transition-colors"
            >
              Skip to search
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
