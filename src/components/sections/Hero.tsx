import { useTranslation } from 'react-i18next';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';

export default function Hero() {
  const { t } = useTranslation();
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12 md:py-24">
      {/* Decorative only: an athletics track bend running under the whole
          hero. The SVG masks itself down on the left so the headline keeps
          its contrast; below lg the hero is a single full-width column, so
          the linework steps back further to stay out of the copy's way. */}
      <img
        src="/hero-track.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50 lg:opacity-100"
      />

      {/* Decorative only: the PSC mark bleeding off the right edge.
          Hidden from assistive tech and below lg, where the hero is
          a single column and the artwork would crowd the copy. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 items-center justify-end lg:flex"
      >
        <div className="absolute -right-24 h-[26rem] w-[26rem] rounded-full bg-white/10 blur-3xl" />
        <img
          src="/betterpsc-logo.svg"
          alt=""
          className="relative -mr-20 w-[20rem] max-w-none opacity-20 xl:-mr-16 xl:w-[24rem]"
        />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left section with title and search */}
          <div className="animate-fade-in">
            <Text transform="uppercase">Welcome to</Text>
            <Heading className="leading-tight">{t('hero.title')}</Heading>
            <Text>{t('hero.subtitle')}</Text>
          </div>
        </div>
      </div>
    </div>
  );
}
