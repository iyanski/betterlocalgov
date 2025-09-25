import React from 'react';
import { Link } from 'react-router-dom';

interface ListItemProps {
  title: string;
  category: string;
  description: string;
  onView?: () => void;
  href?: string;
}

const ListItem: React.FC<ListItemProps> = ({
  title,
  category,
  description,
  onView,
  href,
}) => {
  // Check if href is an external link (starts with http/https) or internal
  const isExternalLink =
    href && (href.startsWith('http://') || href.startsWith('https://'));

  const handleInternalClick = () => {
    if (onView) {
      onView();
    }
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-500 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-lg font-medium text-gray-900">{title}</h4>
          <p className="mt-2 text-sm text-gray-600">{description}</p>
          <span className="inline-block px-2 py-1 mt-2 text-xs font-medium rounded-sm bg-gray-100 text-gray-800">
            {category}
          </span>
        </div>
        {isExternalLink ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 text-sm px-3 py-1.5 h-8 shadow-xs"
          >
            View
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-external-link ml-2 h-4 w-4"
              aria-hidden="true"
            >
              <path d="M15 3h6v6"></path>
              <path d="M10 14 21 3"></path>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            </svg>
          </a>
        ) : href ? (
          <Link
            to={href}
            onClick={handleInternalClick}
            className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 text-sm px-3 py-1.5 h-8 shadow-xs"
          >
            View
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-external-link ml-2 h-4 w-4"
              aria-hidden="true"
            >
              <path d="M15 3h6v6"></path>
              <path d="M10 14 21 3"></path>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            </svg>
          </Link>
        ) : (
          <button
            onClick={handleInternalClick}
            className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 text-sm px-3 py-1.5 h-8 shadow-xs"
          >
            View
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-external-link ml-2 h-4 w-4"
              aria-hidden="true"
            >
              <path d="M15 3h6v6"></path>
              <path d="M10 14 21 3"></path>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ListItem;
