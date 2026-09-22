import { useTranslation } from 'react-i18next';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';

export default function Hero() {
  const { t } = useTranslation();
  const siteName = import.meta.env.VITE_SITE_NAME || 'Better Gattaran';
  const governmentName =
    import.meta.env.VITE_GOVERNMENT_NAME || 'Municipality of Gattaran';
  const province = import.meta.env.VITE_PROVINCE || 'Cagayan';
  const region = import.meta.env.VITE_REGION || 'Region II - Cagayan Valley';

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left section with title and search */}
          <div className="animate-fade-in">
            <Text transform="uppercase">
              Community civic information portal
            </Text>
            <Heading>{siteName}</Heading>
            <Text>{t('hero.subtitle')}</Text>
            <Text className="mt-4 text-primary-100">
              {governmentName} · {province} · {region}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
