import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NuqsAdapter } from 'nuqs/adapters/react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ScrollToTop from './components/ui/ScrollToTop';

function App() {
  return (
    <Router>
      <NuqsAdapter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
          <Footer />
        </div>
      </NuqsAdapter>
    </Router>
  );
}

export default App;
