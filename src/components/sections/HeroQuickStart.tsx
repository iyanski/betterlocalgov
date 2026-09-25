import { Link } from 'react-router-dom';

interface QuickStartItem {
  label: string;
  description: string;
  href: string;
  icon: string;
}

const quickStartItems: QuickStartItem[] = [
  {
    label: 'Civil Registry Services',
    description: 'Birth, marriage & death records',
    href: '/services/civil-registry',
    icon: 'ri-file-list-3-line',
  },
  {
    label: 'Leadership',
    description: 'Meet the mayor, council & officials',
    href: '/government/leadership',
    icon: 'ri-user-star-line',
  },
  {
    label: 'Demographics',
    description: "Aparri's population & community data",
    href: '/statistics/demographics',
    icon: 'ri-group-line',
  },
  {
    label: 'DPWH Projects in Aparri',
    description: 'Track local infrastructure projects',
    href: '/transparency/dpwh-projects',
    icon: 'ri-road-map-line',
  },
];

/**
 * "What brings you here?" quick-start card shown alongside the hero
 * copy, so first-time visitors can jump straight to the most-requested
 * pages instead of hunting through the main menu.
 */
export default function HeroQuickStart() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white text-gray-900 shadow-2xl lg:max-w-sm xl:max-w-md">
      <div className="px-6 pt-6 pb-2 sm:px-8 sm:pt-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-600">
          Let&apos;s get you started
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          What brings you here?
        </h2>
      </div>

      <ul className="mt-2 divide-y divide-gray-100 px-2 sm:px-4">
        {quickStartItems.map(item => (
          <li key={item.label}>
            <Link
              to={item.href}
              className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-gray-50 sm:px-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <i className={`${item.icon} text-xl`} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-gray-900">
                  {item.label}
                </span>
                <span className="block text-sm text-gray-500">
                  {item.description}
                </span>
              </span>
              <i
                className="ri-arrow-right-up-line shrink-0 text-lg text-gray-400 transition-colors group-hover:text-primary-600"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>

      <Link
        to="/search"
        className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4 text-sm font-semibold text-primary-700 transition-colors hover:bg-gray-100 sm:px-8"
      >
        Help me find the right service
        <i className="ri-arrow-right-line text-base" aria-hidden="true" />
      </Link>
    </div>
  );
}
