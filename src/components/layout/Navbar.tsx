import React, { useState } from 'react';
import { mainNavigation } from '../../data/navigation';
import type { LanguageType } from '../../types/index';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../i18n/languages';
import betterAparriLogo from '../../assets/betteraparri.webp';

const emergencyHotlines = [
  { label: 'MDRRMO:', number: '09566542894', icon: 'ri-alarm-warning-line' },
  { label: 'PNP:', number: '09172302003', icon: 'ri-police-badge-line' },
  { label: 'BFP:', number: '09164910946', icon: 'ri-fire-line' },
  { label: 'PCG:', number: '09568301802', icon: 'ri-ship-2-line' },
  {
    label: 'Hospital:',
    number: '09363748430',
    icon: 'ri-hospital-line',
  },
  {
    label: 'RHU-East:',
    number: '09531908364',
    icon: 'ri-first-aid-kit-line',
  },
  {
    label: 'RHU-West:',
    number: '09359519786',
    icon: 'ri-first-aid-kit-line',
  },
];

const primaryEmergencyHotlines = emergencyHotlines.filter(item =>
  ['MDRRMO:', 'PNP:', 'BFP:'].includes(item.label)
);

const secondaryEmergencyHotlines = emergencyHotlines.filter(
  item => !primaryEmergencyHotlines.includes(item)
);

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isHotlinesOpen, setIsHotlinesOpen] = useState(false);
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
    setIsHotlinesOpen(false);
  };

  const toggleSubmenu = (label: string) => {
    setActiveMenu(activeMenu === label ? null : label);
  };

  const changeLanguage = (newLanguage: LanguageType) => {
    i18n.changeLanguage(newLanguage);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar with emergency contacts and language switcher */}
      <div className="border-b border-red-900 bg-red-950 text-white">
        <div className="container mx-auto px-4 py-1.5">
          <div className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
              <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-red-100">
                <i className="ri-phone-line text-sm" />
                <span>Emergency Hotlines</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {primaryEmergencyHotlines.map(item => (
                  <a
                    key={item.label}
                    href={`tel:${item.number}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-300/20 bg-red-800/50 px-2.5 py-1 text-[11px] leading-5 text-red-50 transition-colors hover:bg-red-700/70"
                  >
                    <i className={`${item.icon} text-xs`} />
                    <span className="font-medium text-white">{item.label}</span>
                    <span className="ml-0.5 text-red-100/80">
                      {item.number}
                    </span>
                  </a>
                ))}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsHotlinesOpen(!isHotlinesOpen)}
                    className="inline-flex items-center gap-1 rounded-full border border-red-300/20 bg-red-900/70 px-2.5 py-1 text-[11px] font-medium leading-5 text-red-50 transition-colors hover:bg-red-800"
                    aria-expanded={isHotlinesOpen}
                    aria-haspopup="menu"
                  >
                    More hotlines
                    <i
                      className={`ri-arrow-down-s-line text-sm transition-transform ${isHotlinesOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isHotlinesOpen && (
                    <div
                      className="absolute left-0 top-full z-50 mt-2 w-64 rounded-md bg-white p-2 text-gray-900 shadow-lg ring-1 ring-red-950/10"
                      role="menu"
                    >
                      {secondaryEmergencyHotlines.map(item => (
                        <a
                          key={item.label}
                          href={`tel:${item.number}`}
                          className="flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors hover:bg-red-50 hover:text-red-900"
                          role="menuitem"
                        >
                          <i
                            className={`${item.icon} text-base text-red-700`}
                          />
                          <span className="font-semibold">{item.label}</span>
                          <span className="ml-auto text-gray-600">
                            {item.number}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src={betterAparriLogo}
                alt="BetterAparri.org logo"
                className="mr-3 h-20 w-20 object-cover"
              />
              <div>
                <div className="text-gray-700 font-extrabold text-xl">
                  {t('site_name')}
                </div>
                <div className="text-xs text-gray-600">
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
