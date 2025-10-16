import Navbar from './Navbar';
import Footer from './Footer';
import SkipNavigation from '../ui/SkipNavigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipNavigation />
      <Navbar />
      <main id="main-content" className="flex-grow">
        {children}
      </main>
      <Footer />
    </>
  );
}
