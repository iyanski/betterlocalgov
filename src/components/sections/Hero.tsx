import { useTranslation } from 'react-i18next';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';

export default function Hero() {
  const { t } = useTranslation();
  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-gray-900 dark:to-gray-800 text-white dark:text-gray-100 py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left section with title and search */}
          <div className="animate-fade-in">
            <Text
              transform="uppercase"
              className="text-white/90 dark:text-gray-300"
            >
              Welcome to
            </Text>
            <Heading className="text-white dark:text-white">
              {import.meta.env.VITE_GOVERNMENT_NAME}
            </Heading>
            <Text className="text-white/90 dark:text-gray-300">
              {t('hero.subtitle')}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
