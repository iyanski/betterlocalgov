import Hero from '../components/sections/Hero';
import ServicesSection from '../components/home/ServicesSection';
import GovernmentActivitySection from '../components/home/GovernmentActivitySection';
import SEO from '../components/SEO';
import { CivicTechBanner } from '@bettergov/kapwa/civic-tech-banner';
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
  const { t } = useTranslation();

  const joinUsBanner = {
    title: 'Join the',
    highlightedWord: '#CivicTech',
    description: t('joinUs.bannerSubtitle'),
    highlightedPhrase: t('joinUs.bannerHighlight'),
    primaryButton: { text: t('joinUs.joinMovement'), href: '/join-us' },
    secondaryButton: { text: t('joinUs.joinDiscord'), href: '/discord' },
  };

  return (
    <>
      <SEO
        title="Home"
        description="Official website of your local government. Access government services, information, and resources."
        keywords="government, local government, services, public services, civic services"
      />
      <main className="flex-grow">
        <Hero />
        <ServicesSection />
        <GovernmentActivitySection />
        <div className="container mx-auto px-4 py-12">
          <CivicTechBanner
            fullBannerTitle={t('joinUs.bannerTitle')}
            fullBanner={joinUsBanner}
          />
        </div>
      </main>
    </>
  );
};

export default Home;
