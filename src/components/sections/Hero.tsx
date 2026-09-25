import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@bettergov/kapwa/button';
import HeroQuickStart from './HeroQuickStart';

export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-[#0f47b8] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_34%),linear-gradient(135deg,_#1849b2_0%,_#0d3794_100%)]" />
      <div className="relative container mx-auto py-18 md:py-16 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-4 lg:gap-10">
          <div className="lg:col-span-2">
            <p className="text-sm font-light tracking-wider text-white lg:text-lg">
              Maddulô Kamu ta
            </p>
            <h1 className="text-4xl font-semibold mt-4 tracking-tight text-white sm:text-4xl lg:text-6xl">
              {t('hero.title')}
            </h1>
            <p className="mt-4 max-w text-base leading-8 text-blue-50 sm:text-lg">
              {t('hero.subtitle')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                className="justify-center bg-yellow-400 text-yellow-900 hover:bg-yellow-500 rounded-2xl px-6 py-3.5 text-base font-semibold shadow-xl"
                onClick={() => navigate('/services')}
              >
                <i className="ri-arrow-right-line mr-2" />
                {t('hero.browseServices')}
              </Button>
            </div>
          </div>
          <div className="w-full lg:col-span-2">
            <HeroQuickStart />
          </div>
        </div>
      </div>
    </section>
  );
}
