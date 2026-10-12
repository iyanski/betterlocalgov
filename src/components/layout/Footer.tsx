import React from 'react';
import { footerNavigation } from '../../data/navigation';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation('common');
  const siteName = import.meta.env.VITE_SITE_NAME || 'Better Gattaran';
  const governmentName =
    import.meta.env.VITE_GOVERNMENT_NAME || 'Municipality of Gattaran';

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img
                src="/bettergattaran.png"
                alt={`${siteName} logo`}
                className="h-12 w-12 mr-3 shrink-0 object-contain scale-[1.75]"
              />

              <div>
                <div className="font-bold">{siteName}</div>
                <div className="text-xs text-gray-400">
                  Civic information for {governmentName}
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">{t('footer.status')}</p>
            <p className="text-gray-400 text-xs">
              Sources are shown where available. External links do not imply
              endorsement.
            </p>
          </div>

          {footerNavigation.mainSections.map(section => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              {t('footer.attribution')}
            </p>
            <div className="flex space-x-6">
              {/* <a
                href="/privacy"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms of Use
              </a> */}
              <a
                href="https://github.com/bettergovph/betterlocalgov"
                className="text-gray-400 hover:text-white text-sm transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                BetterLocalGov on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
