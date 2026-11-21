import { useTranslation } from 'react-i18next';
import Container from '../ui/Container';

const env = import.meta.env;
const eyebrow =
  [env.VITE_GOVERNMENT_TYPE, env.VITE_PROVINCE, env.VITE_REGION]
    .filter(Boolean)
    .join(' · ') || 'Local government portal';

// Band Navy masthead: flat colour, never a gradient.
export default function Hero() {
  const { t } = useTranslation();
  return (
    <section className="bg-ed-navy-2 py-16 text-white md:py-24">
      <Container>
        <div className="max-w-[850px] animate-fade-in">
          <p className="eyebrow text-white/75">{eyebrow}</p>
          <h1 className="mt-6 font-display text-[clamp(36px,6vw,72px)] font-bold leading-[1.02] tracking-[-0.02em] text-white">
            {import.meta.env.VITE_GOVERNMENT_NAME}
          </h1>
          <p className="mt-5 max-w-[720px] text-lg leading-relaxed text-white/85 max-md:text-base">
            {t('hero.subtitle')}
          </p>
        </div>
      </Container>
    </section>
  );
}
