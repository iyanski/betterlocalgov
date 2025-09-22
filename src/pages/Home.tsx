import Hero from '../components/sections/Hero';
import ServicesSection from '../components/home/ServicesSection';
import GovernmentActivitySection from '../components/home/GovernmentActivitySection';

const Home: React.FC = () => {
  return (
    <main className="flex-grow">
      <Hero />
      <ServicesSection />
      <GovernmentActivitySection />
    </main>
  );
};

export default Home;
