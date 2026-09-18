import { lazy, Suspense } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ScrollToTop from './components/ui/ScrollToTop';
import PageSkeleton from './components/ui/PageSkeleton';
import { isMeilisearchEnabled } from './lib/meilisearch';
import { BrowserRouter as Router, Routes, Route } from 'react-router';

/**
 * Home stays eagerly imported -- it is the landing route, and code-splitting it
 * would only add a round trip to the page most people see first. Everything
 * else is lazy: the data stories carry their own datasets, and without this
 * they would all land in the entry chunk whether or not anyone opens them.
 */
const Services = lazy(() => import('./pages/Services'));
const Government = lazy(() => import('./pages/Government'));
const Document = lazy(() => import('./pages/Document'));
const Search = lazy(() => import('./pages/Search'));
const Participation = lazy(() => import('./pages/Participation'));
const DataIndex = lazy(() => import('./pages/data/DataIndex'));
const Budget = lazy(() => import('./pages/data/Budget'));
const Revenue = lazy(() => import('./pages/data/Revenue'));

function App() {
  return (
    <HelmetProvider>
      <Router>
        <NuqsAdapter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <ScrollToTop />
            {/* Suspense sits inside the layout so the navbar and footer stay
                put while a route chunk loads, rather than the page blanking. */}
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/services/:category" element={<Services />} />
                <Route path="/services" element={<Services />} />
                <Route
                  path="/services/:category/:documentSlug"
                  element={<Document categoryType="service" />}
                />
                <Route path="/government/:category" element={<Government />} />
                <Route path="/government" element={<Government />} />
                <Route
                  path="/government/:category/:documentSlug"
                  element={<Document categoryType="government" />}
                />
                {/* Data stories. These are declared before the catch-all
                    document routes for readability only -- React Router ranks a
                    static segment above a dynamic one, so /data/participation
                    beats /:lang/:documentSlug regardless of order. Worth
                    knowing, because the failure mode if that ever changed is a
                    data page quietly rendering the document viewer's
                    "not found". */}
                <Route path="/data" element={<DataIndex />} />
                <Route path="/data/budget" element={<Budget />} />
                <Route path="/data/participation" element={<Participation />} />
                <Route path="/data/revenue" element={<Revenue />} />
                {isMeilisearchEnabled && (
                  <Route path="/search" element={<Search />} />
                )}
                <Route path="/:lang/:documentSlug" element={<Document />} />
                <Route path="/:documentSlug" element={<Document />} />
              </Routes>
            </Suspense>
            <Footer />
          </div>
        </NuqsAdapter>
      </Router>
    </HelmetProvider>
  );
}

export default App;
