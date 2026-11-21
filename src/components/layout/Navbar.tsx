import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Menu,
  ChevronDown,
  Globe,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { mainNavigation } from '../../data/navigation';
import type { LanguageType } from '../../types/index';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../i18n/languages';
import { isMeilisearchEnabled } from '../../lib/meilisearch';
import Container from '../ui/Container';

const utilityLinks = [
  { label: 'Join Us', href: 'https://bettergov.ph/join-us' },
  { label: 'About BetterGov', href: 'https://bettergov.ph/about' },
  { label: 'Official Gov.ph', href: 'https://www.gov.ph' },
  { label: 'Hotlines', href: 'https://bettergov.ph/philippines/hotlines' },
];

const navLinkClass =
  'inline-flex items-center gap-1.5 whitespace-nowrap px-5 py-3 font-display text-base font-semibold text-ed-ink-2 no-underline transition-colors hover:bg-ed-navy-tint hover:text-ed-navy';

const mobileLinkClass =
  'flex w-full items-center justify-between px-4 py-3 font-display text-base font-semibold text-ed-ink-2 hover:bg-ed-navy-tint hover:text-ed-navy';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { t, i18n } = useTranslation('common');
  const headerRef = useRef<HTMLElement>(null);

  // Publish the sticky header's height so in-page anchors and sticky
  // sidebars can clear it (see --header-height in index.css).
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      root.style.setProperty('--header-height', `${header.offsetHeight}px`);
    });
    observer.observe(header);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--header-height');
    };
  }, []);

  const navLabel = (label: string) =>
    t(`navbar.${label.replace(' ', '').toLowerCase()}`);

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

  const languageSelect = (className: string) => (
    <select
      value={i18n.language}
      onChange={e => changeLanguage(e.target.value as LanguageType)}
      aria-label="Language"
      className={className}
    >
      {Object.entries(LANGUAGES).map(([code, lang]) => (
        <option key={code} value={code} className="text-ed-ink">
          {lang.nativeName}
        </option>
      ))}
    </select>
  );

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-ed-rule bg-ed-paper"
    >
      {/* Utility strip */}
      <div className="bg-ed-navy-2 text-white">
        <Container className="flex h-9 items-center justify-between gap-4">
          <span className="eyebrow hidden text-[10px] text-white/80 md:block">
            Republic of the Philippines
          </span>
          <div className="flex min-w-0 items-center gap-5 overflow-x-auto whitespace-nowrap text-xs">
            {utilityLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-white/85 no-underline hover:text-white hover:underline"
              >
                {link.label}
              </a>
            ))}
            <div className="hidden md:block">
              {languageSelect(
                'border border-white/30 bg-transparent px-2 py-0.5 text-xs text-white hover:border-white focus:border-white'
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Masthead */}
      <Container className="flex items-center justify-between gap-6 py-4">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-3 no-underline"
            onClick={closeMenu}
          >
            <CheckCircle2
              className="h-10 w-10 shrink-0 text-ed-navy max-md:h-8 max-md:w-8"
              aria-hidden
            />
            <span className="font-display text-xl font-bold leading-tight tracking-[-0.01em] text-ed-ink max-md:text-lg">
              {import.meta.env.VITE_GOVERNMENT_NAME}
            </span>
          </Link>
          <p className="eyebrow hidden max-w-[300px] border-l border-ed-rule pl-6 text-[10px] leading-tight tracking-[0.16em] text-ed-ink-3 xl:block">
            {t('site_description')}
          </p>
        </div>

        {isMeilisearchEnabled && (
          <Link
            to="/search"
            className="hidden h-11 items-center gap-2.5 border border-ed-navy px-5 text-sm font-medium text-ed-navy no-underline transition-colors hover:bg-ed-navy hover:text-white lg:inline-flex"
          >
            <Search className="h-4 w-4" aria-hidden />
            Search
          </Link>
        )}

        {/* Mobile menu button */}
        <button
          onClick={toggleMenu}
          aria-expanded={isOpen}
          className="inline-flex items-center justify-center p-2 text-ed-ink hover:bg-ed-navy-tint hover:text-ed-navy lg:hidden"
        >
          <span className="sr-only">
            {isOpen ? 'Close main menu' : 'Open main menu'}
          </span>
          {isOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </Container>

      {/* Desktop navigation */}
      <nav className="hidden border-t border-ed-rule lg:block">
        <Container className="flex items-center">
          {mainNavigation.map(item => (
            <div key={item.label} className="group relative">
              <Link to={item.href} className={navLinkClass}>
                {navLabel(item.label)}
                {item.children && (
                  <ChevronDown className="h-4 w-4" aria-hidden />
                )}
              </Link>
              {item.children && (
                <div className="invisible absolute left-0 z-50 min-w-64 border border-ed-rule bg-ed-paper py-2 opacity-0 transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <div role="menu" aria-orientation="vertical">
                    {item.children.map(child => (
                      <Link
                        key={child.label}
                        to={child.href}
                        className="block px-4 py-2.5 text-sm text-ed-ink-2 no-underline hover:bg-ed-navy-tint hover:text-ed-navy"
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
          <Link to="/about" className={navLinkClass}>
            About
          </Link>
        </Container>
      </nav>

      {/* Mobile menu */}
      <div
        className={`border-t border-ed-rule bg-ed-paper lg:hidden ${isOpen ? 'block' : 'hidden'}`}
      >
        <Container className="space-y-1 px-0 py-3">
          {mainNavigation.map(item =>
            item.children ? (
              <div key={item.label}>
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  aria-expanded={activeMenu === item.label}
                  className={mobileLinkClass}
                >
                  {navLabel(item.label)}
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      activeMenu === item.label ? 'rotate-180' : ''
                    }`}
                    aria-hidden
                  />
                </button>
                {activeMenu === item.label && (
                  <div className="space-y-1 border-l-2 border-ed-navy bg-ed-paper-2 py-2 ml-4">
                    {item.children.map(child => (
                      <Link
                        key={child.label}
                        to={child.href}
                        onClick={closeMenu}
                        className="block px-4 py-2 text-sm text-ed-ink-2 hover:text-ed-navy"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                to={item.href}
                onClick={closeMenu}
                className={mobileLinkClass}
              >
                {navLabel(item.label)}
              </Link>
            )
          )}
          <Link to="/about" onClick={closeMenu} className={mobileLinkClass}>
            About
          </Link>
          {isMeilisearchEnabled && (
            <Link to="/search" onClick={closeMenu} className={mobileLinkClass}>
              Search
            </Link>
          )}
          <div className="mt-2 flex items-center gap-2 border-t border-ed-rule px-4 pt-4">
            <Globe className="h-5 w-5 text-ed-ink-2" aria-hidden />
            {languageSelect(
              'border border-ed-rule-strong bg-ed-paper px-2 py-1 text-sm text-ed-ink hover:border-ed-navy focus:border-ed-navy'
            )}
          </div>
        </Container>
      </div>
    </header>
  );
};

export default Navbar;
