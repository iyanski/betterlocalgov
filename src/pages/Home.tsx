import Hero from '../components/sections/Hero';
import ServicesSection from '../components/home/ServicesSection';

const Home: React.FC = () => {
  return (
    <main className="flex-grow">
      <Hero />
      <ServicesSection />
    </main>
  );
};

export default Home;
