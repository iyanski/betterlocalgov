import React, { useState } from 'react';
import { mainNavigation } from '../../data/navigation';
import type { LanguageType } from '../../types/index';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../i18n/languages';
import betterAparriLogo from '../../assets/betteraparri.webp';

const GITHUB_REPO_URL = 'https://github.com/egiebk/betteraparri';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { t, i18n } = useTranslation('common');

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setActiveMenu(null);
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
    setActiveMenu(null);
  };

  const toggleSubmenu = (label: string) => {
    setActiveMenu(activeMenu === label ? null : label);
  };

  const changeLanguage = (newLanguage: LanguageType) => {
    i18n.changeLanguage(newLanguage);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      {/* Slim utility strip: Join Us, Community Project, Hotlines, Language */}
      <div className="border-b border-gray-200 bg-gray-50 text-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex h-9 items-center justify-end text-xs">
            <div className="flex items-center gap-4">
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-medium text-primary-700 hover:text-primary-800"
              >
                <i className="ri-github-fill text-sm" aria-hidden="true" />
                Join Us
              </a>
              <span className="hidden items-center gap-1 text-gray-500 sm:flex">
                <i className="ri-shield-star-line text-sm" aria-hidden="true" />
                Community Project
              </span>
              <a
                href="https://hotlines.bettergov.ph/?city=aparri&province=cagayan"
                target="_blank"
                className="flex items-center gap-1 font-medium text-red-700 hover:text-red-800"
              >
                <i className="ri-phone-line text-sm" aria-hidden="true" />
                Hotlines
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3 sm:py-4">
          <div className="flex items-center min-w-0">
            <Link to="/" className="flex min-w-0 items-center">
              <img
                src={betterAparriLogo}
                alt="BetterAparri.org logo"
                className="mr-2 h-12 w-12 shrink-0 object-cover sm:mr-3 sm:h-16 sm:w-16 lg:h-20 lg:w-20"
              />
              <div className="min-w-0">
                <div className="truncate text-base font-extrabold text-gray-700 sm:text-lg lg:text-xl">
                  {t('site_name')}
                </div>
                <div className="hidden text-xs text-gray-600 sm:block">
                  {t('site_description')}
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center space-x-8 pr-24">
            {mainNavigation.map(item => (
              <div key={item.label} className="relative group">
                <Link
                  to={item.href}
                  className="flex h-10 items-center text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  {item.label}
                  {item.children && (
                    <i className="ri-arrow-down-s-line ml-1 inline-flex h-4 w-4 items-center justify-center text-gray-800 leading-none transition-colors group-hover:text-primary-600" />
                  )}
                </Link>
                {item.children && (
                  <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      {item.children.map(child => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className="text-left block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                          role="menuitem"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center">
            <Link
              to="/search"
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
            >
              <i className="ri-search-line h-5 w-5" aria-hidden="true" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <i className="ri-close-line block h-6 w-6" aria-hidden="true" />
              ) : (
                <i className="ri-menu-line block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="container mx-auto px-2 pt-2 pb-4 space-y-1 border-t border-gray-200 bg-white">
          {mainNavigation.map(item => (
            <div key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className="w-full flex justify-between items-center px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-500"
                  >
                    {item.label}
                    <i
                      className={`ri-arrow-down-s-line h-5 w-5 transition-transform ${
                        activeMenu === item.label ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {activeMenu === item.label && (
                    <div className="pl-6 py-2 space-y-1 bg-gray-50">
                      {item.children.map(child => (
                        <Link
                          key={child.label}
                          to={child.href}
                          onClick={closeMenu}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-500"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.href}
                  onClick={closeMenu}
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-500"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
          <Link
            to="/search"
            onClick={closeMenu}
            className="flex items-center gap-2 px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-500"
          >
            <i className="ri-search-line h-5 w-5" aria-hidden="true" />
            Search
          </Link>
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center">
              <i className="ri-global-line h-5 w-5 text-gray-800 mr-2" />
              <select
                value={i18n.language}
                onChange={e => changeLanguage(e.target.value as LanguageType)}
                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 hover:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
              >
                {Object.entries(LANGUAGES).map(([code, lang]) => (
                  <option key={code} value={code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
