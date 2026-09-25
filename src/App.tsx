import { NuqsAdapter } from 'nuqs/adapters/react';
import { Analytics } from '@vercel/analytics/react';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/layout/Navbar';
import TyphoonAdvisoryBanner from './components/layout/TyphoonAdvisoryBanner';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ScrollToTop from './components/ui/ScrollToTop';
import CardFadeInObserver from './components/ui/CardFadeInObserver';
import Services from './pages/Services';
import Document from './pages/Document';
import Government from './pages/Government';
import Updates from './pages/Updates';
import Search from './pages/Search';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <NuqsAdapter>
          <div className="min-h-screen flex flex-col">
            <TyphoonAdvisoryBanner />
            <Navbar />
            <ScrollToTop />
            <CardFadeInObserver />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services/:category" element={<Services />} />
              <Route path="/services" element={<Services />} />
              <Route
                path="/services/:category/:documentSlug"
                element={<Document categoryType="service" />}
              />
              <Route
                path="/transparency"
                element={<Government sectionType="transparency" />}
              />
              <Route
                path="/transparency/:documentSlug"
                element={<Document categoryType="transparency" />}
              />
              <Route
                path="/statistics"
                element={<Government sectionType="statistics" />}
              />
              <Route
                path="/statistics/:documentSlug"
                element={<Document categoryType="statistics" />}
              />
              <Route path="/government/:category" element={<Government />} />
              <Route path="/government" element={<Government />} />
              <Route
                path="/government/:category/:documentSlug"
                element={<Document categoryType="government" />}
              />
              <Route path="/:lang/:documentSlug" element={<Document />} />
              <Route path="/:documentSlug" element={<Document />} />
              <Route path="/updates" element={<Updates />} />
              <Route path="/search" element={<Search />} />
            </Routes>
            <Footer />
            <Analytics />
          </div>
        </NuqsAdapter>
      </Router>
    </HelmetProvider>
  );
}

export default App;
