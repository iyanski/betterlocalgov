import React from 'react';
import { footerNavigation } from '../../data/navigation';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import packageJson from '../../../package.json';
import betterAparriLogo from '../../assets/betteraparri-bw.webp';

const Footer: React.FC = () => {
  const { t } = useTranslation('common');

  const getSocialIcon = (label: string) => {
    switch (label) {
      case 'Facebook':
        return <i className="ri-facebook-fill h-5 w-5" />;
      case 'GitHub':
        return <i className="ri-github-line h-5 w-5" />;
      case 'Instagram':
        return <i className="ri-instagram-line h-5 w-5" />;
      case 'YouTube':
        return <i className="ri-youtube-line h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <footer className="bg-gray-900 text-white print:hidden">
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="gap-8 md:grid md:grid-cols-4">
          <div className="col-span-2">
            <div className="flex items-center mb-4">
              <img
                src={betterAparriLogo}
                alt="BetterAparri.org logo"
                className="mr-3 h-16 w-16 object-cover"
              />

              <div>
                <div className="font-bold">{t('site_name')}</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {t('site_description')}
              <span className="block mt-2 text-xs text-gray-600">
                {t('footer.cc2')}
              </span>
            </p>
            <div className="flex space-x-4">
              {footerNavigation.socialLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getSocialIcon(link.label)}
                </Link>
              ))}
            </div>
            <p className="text-left text-md text-center font-mono text-emerald-300 pt-8 font-semibold">
              <span className="px-4 py-1 md:p-2 md:px-4 bg-emerald-900 rounded-full ">
                Cost to the People of Aparri: ₱0.00
              </span>
            </p>
          </div>

          {footerNavigation.mainSections.map(section => (
            <div key={section.title}>
              <h3 className="text-md font-semibold my-4">{section.title}</h3>
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
          <div className="flex flex-col md:flex-row lg:justify-between items-center">
            <p className="text-gray-400 text-sm md:mb-0?0">
              <span className="text-sm text-extralight text-white">
                {t('footer.cc')}
              </span>
            </p>
            <div className="flex space-x-6 items-center">
              <Link
                to=""
                className="text-gray-600 hover:text-white text-xs transition-colors font-mono"
              >
                v{packageJson.version}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
