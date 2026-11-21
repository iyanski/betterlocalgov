import React from 'react';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  CheckCircle2,
} from 'lucide-react';
import { footerNavigation } from '../../data/navigation';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import Container from '../ui/Container';

const linkClass =
  'text-white/80 no-underline transition-colors hover:text-white hover:underline';

const Footer: React.FC = () => {
  const { t } = useTranslation('common');

  const getSocialIcon = (label: string) => {
    switch (label) {
      case 'Facebook':
        return <Facebook className="h-5 w-5" />;
      case 'Twitter':
        return <Twitter className="h-5 w-5" />;
      case 'Instagram':
        return <Instagram className="h-5 w-5" />;
      case 'YouTube':
        return <Youtube className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <footer className="mt-auto bg-ed-navy-ink pt-14 pb-7 text-sm text-white/75 max-md:pt-10">
      <Container>
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-[2fr_repeat(3,1fr)] max-md:gap-8 max-md:pb-8">
          <div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-10 w-10 text-white" aria-hidden />
              <div>
                <div className="font-display text-lg font-bold text-white">
                  {t('site_name')}
                </div>
                <div className="eyebrow text-[10px] text-white/60">
                  BetterGov.ph Portal
                </div>
              </div>
            </div>
            <p className="mt-4 max-w-[340px] leading-relaxed text-white/60">
              A community portal providing Philippine citizens, businesses, and
              visitors with information and services.
            </p>
            <div className="mt-6 flex gap-4">
              {footerNavigation.socialLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.href}
                  aria-label={link.label}
                  className="text-white/60 transition-colors hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getSocialIcon(link.label)}
                </Link>
              ))}
            </div>
          </div>

          {footerNavigation.mainSections.map(section => (
            <div key={section.title}>
              <h3 className="eyebrow mb-[18px] font-mono text-white">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map(link => (
                  <li key={link.label}>
                    <Link to={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 pt-6 text-[13px] md:flex-row md:items-center md:justify-between">
          <p className="text-white/60">{t('footer.copyright')}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              to="https://github.com/bettergovph/bettergov"
              className={linkClass}
            >
              Contribute on GitHub
            </Link>
            <Link to="/sitemap" className={linkClass}>
              Sitemap
            </Link>
            <a href="/accessibility" className={linkClass}>
              Accessibility
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
