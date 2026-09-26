import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const location = useLocation();

  // Generate breadcrumbs from current path if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Convert segment to readable label
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  return (
    <nav
      className={`flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-gray-600 print:hidden ${className}`}
      aria-label="Breadcrumb"
    >
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index === 0 && <i className="ri-home-line h-4 w-4" />}
          {index > 0 && (
            <i className="ri-arrow-right-s-line h-4 w-4 text-gray-400" />
          )}
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-primary-600 transition-colors duration-200"
            >
              {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium" aria-current="page">
              {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
